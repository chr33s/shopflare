import { config, getSessionFromStorage, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequest: PagesFunction<Env> = async (context) => {
	const sessionId = await shopify(context).session.getCurrentId({
		isOnline: config.isOnline,
		rawRequest: context.request,
	});
	const session = await getSessionFromStorage(context, sessionId!);
	const client = new (shopify as any)(context).clients.Rest({ session });

	const method = context.request.method.toLocaleLowerCase();
	const data = await context.request.json();
	const path = (context.params.catchall as string[]).join("/");
	const response = await (client as any)[method]({
		data,
		path,
	});

	return new Response(JSON.stringify(response.body), {
		headers: response.headers,
		status: response.status,
	});
};
