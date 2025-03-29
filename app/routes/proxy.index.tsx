import { useTranslation } from "react-i18next";

import { Form } from "~/components/proxy";
import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/proxy.index";

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
			<Form action="">
				<button onClick={() => console.log("proxy.click")} type="button">
					click
				</button>
			</Form>
		</div>
	);
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data };
}
