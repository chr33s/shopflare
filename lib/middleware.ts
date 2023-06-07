import type { Env } from "@/functions/types";

export {
	checkBillingPlan,
	ensureInstalledOnShop,
	validateAuthenticatedSession,
} from "./shopify";

export const errorHandling: PagesFunction<Env> = async (context) => {
	try {
		return await context.next();
	} catch (err: any) {
		return new Response(
			JSON.stringify({
				message: err.message,
				stack: err.stack,
				status: "nok",
			}),
			{ status: 500 }
		);
	}
};
