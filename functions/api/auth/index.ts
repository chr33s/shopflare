import { redirectToAuth } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
	return redirectToAuth(context, false);
};
