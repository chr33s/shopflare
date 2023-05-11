import type { Env } from "@/functions/types";
import { shopify } from "@/lib/shopify";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const rawBody = await context.request.text();

	let response: Response;
	try {
		response = await shopify(context).webhooks.process({
			rawBody,
			rawRequest: context.request,
		});
	} catch (error: any) {
		console.error(error.message);
		response = error.response;
	}
	return response;
};
