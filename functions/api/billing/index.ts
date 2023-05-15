import { saveBillingPlan, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const billing = shopify(context).config.billing;
	return new Response(JSON.stringify(billing));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const body: any = await context.request.json();
	const confirmationUrl = await saveBillingPlan(context, body.plan);
	return new Response(JSON.stringify({ confirmationUrl }));
};
