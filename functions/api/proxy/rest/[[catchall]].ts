import { getSession, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequest: PagesFunction<Env> = async (context) => {
	const session: any = await getSession(context, true);

	const client = new (shopify(context).clients.Rest)({ session });

	const method = context.request.method.toLocaleLowerCase();
	const data = await context.request.text();
	const path = (context.params.catchall as string[]).join("/");
	const query = Object.fromEntries(new URL(context.request.url).searchParams);

	const response = await (client as any)[method]({
		data,
		path,
		query,
	});

	return new Response(JSON.stringify(response.body), {
		headers: response.headers,
		status: response.status,
	});
};
