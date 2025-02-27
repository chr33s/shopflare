import { Outlet } from "react-router";

import type { Route } from "./+types/proxy";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("proxy");

		const proxy = await shopify.proxy(request);
		shopify.utils.log.debug("proxy", { ...proxy });

		return new Response(null, { status: 204 });
	} catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}

export default function Proxy() {
	return <Outlet />;
}
