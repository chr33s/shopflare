import type { Crypto } from "@cloudflare/workers-types/experimental";
import { Outlet } from "react-router";

import type { Route } from "./+types/proxy";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);

	const param = url.searchParams.get("signature");
	if (param === null) {
		return new Response("Proxy param is missing", { status: 400 });
	}

	url.searchParams.delete("signature");
	url.searchParams.sort();
	const params = url.searchParams.toString();

	const encoder = new TextEncoder();
	const encodedKey = encoder.encode(shopify.config.apiSecretKey);
	const encodedData = encoder.encode(params);
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
	const encodedParam = encoder.encode(param);
	if (encodedBody.byteLength !== encodedParam.byteLength) {
		return new Response("Encoded byte length mismatch", { status: 401 });
	}

	const valid = (crypto as Crypto).subtle.timingSafeEqual(
		encodedBody,
		encodedParam,
	);
	if (!valid) {
		return new Response("Invalid hmac", { status: 401 });
	}

	shopify.utils.log.debug("proxy", {
		params: Object.fromEntries(url.searchParams),
	});

	return new Response(null, { status: 204 });
}

export default function Proxy() {
	return <Outlet />;
}
