import type { Env } from "@/functions/types";
import { getSession, shopify } from "@/lib/shopify";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const session: any = await getSession(context, true);
	const storefront = new (shopify(context).clients.Storefront)({ session });
	const data: string = await context.request.json();
	const response: any = await storefront.query({ data });

	return new Response(JSON.stringify(response.body), response);
};
