import { Outlet } from "react-router";

import { Provider } from "~/components/Proxy";
import { getFixedT } from "~/i18n.server";
import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/proxy";

export async function loader({ context, request }: Route.LoaderArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("proxy");

		await shopify.proxy(request);

		return { appUrl: shopify.config.appUrl };
		// biome-ignore lint/suspicious/noExplicitAny: catch(err)
	} catch (error: any) {
		const t = await getFixedT(request, "app");
		return new Response(error.message, {
			status: error.status,
			statusText: t("errorUnauthorized"),
		});
	}
}

export default function ProxyRoute({ loaderData }: Route.ComponentProps) {
	const { appUrl } = loaderData ?? {};

	return (
		<Provider appUrl={appUrl}>
			<Outlet />
		</Provider>
	);
}
