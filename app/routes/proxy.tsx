import { Outlet } from "react-router";

import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/proxy";

export async function loader({ context, request }: Route.LoaderArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("proxy");

		const proxy = await shopify.proxy(request);
		shopify.utils.log.debug("proxy", { ...proxy });

		return new Response(null, { status: 204 });
		// biome-ignore lint/suspicious/noExplicitAny: catch(err)
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: upstream
export default function Proxy() {
	return <Outlet />;
}
