import { getSessionFromStorage, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const sessionId = await shopify(context).session.getCurrentId({
		isOnline: false,
		rawRequest: context.request,
	});
	const session: any = await getSessionFromStorage(context, sessionId!);
	const rawBody: string = await context.request.json();

	const response: any = await shopify(context).clients.graphqlProxy({
		rawBody,
		session,
	});

	return new Response(JSON.stringify(response.body), {
		headers: response.headers,
		status: response.status,
	});
};
