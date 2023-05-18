import { getSession, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const session: any = await getSession(context, true);

	const rawBody: string = await context.request.json();
	const response: any = await shopify(context).clients.graphqlProxy({
		rawBody,
		session,
	});

	return new Response(JSON.stringify(response.body), response);
};
