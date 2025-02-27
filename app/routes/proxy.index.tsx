import { useTranslation } from "react-i18next";

import type { Route } from "./+types/proxy.index";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("proxy.index");

	await shopify.proxy(request);

	const data = {};
	return { data };
}

export default function ProxyIndex() {
	const { t } = useTranslation("proxy");

	return (
		<div
			style={{
				alignItems: "center",
				display: "flex",
				height: "100vh",
				justifyContent: "center",
				width: "100vw",
			}}
		>
			<h1>{t("proxy")}</h1>
		</div>
	);
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data };
}

export const handle = {
	i18n: "proxy",
};
