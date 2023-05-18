import type { Env } from "@/functions/types";
import { config, getSession, shopify } from "@/lib/shopify";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const session: any = await getSession(context, true);

	const admin = new (shopify(context).clients.Rest)({ session });
	const storefrontTokens: any = await admin.get({
		path: "storefront_access_tokens",
	});
	const storefrontAccessToken =
		storefrontTokens.body.storefront_access_tokens.find(
			(v: any) => v.title === config.storefrontAccessTokenTitle
		)?.access_token;
	if (storefrontAccessToken) {
		return new Response("No storefront token found", { status: 403 });
	}

	const storefront = new (shopify(context).clients.Storefront)({
		domain: session?.shop,
		storefrontAccessToken,
	});
	const data: string = await context.request.json();
	const response: any = await storefront.query({ data });

	return new Response(JSON.stringify(response.body), {
		headers: response.headers,
		status: response.status,
	});
};
