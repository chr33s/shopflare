import type { Env } from "@/functions/types";

export { ensureInstalledOnShop, validateAuthenticatedSession } from "./shopify";

export const errorHandling: PagesFunction<Env> = async (context) => {
	try {
		return await context.next();
	} catch (err: any) {
		return new Response(`${err.message}\n${err.stack}`, { status: 500 });
	}
};
