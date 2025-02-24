import type { Crypto } from "@cloudflare/workers-types/experimental";

import type { Route } from "./+types/shopify.webhooks";
import { createShopify } from "~/shopify.server";

export async function action({ context, request }: Route.ActionArgs) {
	const shopify = createShopify(context);

	// validate.body
	const body = await request.text();
	if (body.length === 0) {
		return new Response("Webhook body is missing", { status: 400 });
	}

	// validate.hmac
	const header = request.headers.get("X-Shopify-Hmac-Sha256");
	if (header === null) {
		return new Response("Webhook header is missing", { status: 400 });
	}

	const encoder = new TextEncoder();
	const encodedKey = encoder.encode(shopify.config.apiSecretKey);
	const encodedData = encoder.encode(body);
	const hmacKey = await crypto.subtle.importKey(
		"raw",
		encodedKey,
		{
			name: "HMAC",
			hash: "SHA-256",
		},
		true,
		["sign", "verify"],
	);
	const signature = await crypto.subtle.sign("HMAC", hmacKey, encodedData);
	const hmac = btoa(String.fromCharCode(...new Uint8Array(signature))); // base64

	const encodedBody = encoder.encode(hmac);
	const encodedHeader = encoder.encode(header);
	if (encodedBody.byteLength !== encodedHeader.byteLength) {
		return new Response("Encoded byte length mismatch", { status: 401 });
	}

	const valid = (crypto as Crypto).subtle.timingSafeEqual(
		encodedBody,
		encodedHeader,
	);
	if (!valid) {
		return new Response("Invalid hmac", { status: 401 });
	}

	// validate.headers
	const requiredHeaders = {
		apiVersion: "X-Shopify-API-Version",
		domain: "X-Shopify-Shop-Domain",
		hmac: "X-Shopify-Hmac-Sha256",
		topic: "X-Shopify-Topic",
		webhookId: "X-Shopify-Webhook-Id",
	};
	if (!Object.values(requiredHeaders).some(request.headers.has)) {
		return new Response("Webhook headers are missing", { status: 400 });
	}
	const optionalHeaders = { subTopic: "X-Shopify-Sub-Topic" };
	const headers = { ...requiredHeaders, ...optionalHeaders };
	const webhook = Object.keys(headers).reduce(
		(headers, header) => ({
			...headers,
			[header]: request.headers.get(header),
		}),
		{} as typeof headers,
	);
	shopify.utils.log.debug("shopify.webhooks", { ...webhook });

	const session = await shopify.session.get(webhook.domain);

	switch (webhook.topic) {
		// app
		case "APP_UNINSTALLED": {
			if (!session) {
				break;
			}
			await shopify.session.delete(session.id);

			break;
		}
		case "APP_PURCHASES_ONE_TIME_UPDATE":
		case "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT":
		case "APP_SUBSCRIPTIONS_UPDATE":

		// compliance
		case "CUSTOMERS_DATA_REQUEST": // eslint-disable-line no-fallthrough
		case "CUSTOMERS_REDACT":
		case "SHOP_REDACT":
			break;
	}

	throw new Response(undefined, { status: 204 });
}
