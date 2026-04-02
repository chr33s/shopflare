import { useTranslation } from "react-i18next";
import { Form } from "#app/components/proxy";
import { shopify } from "#app/shopify.server";
import type { Route } from "./+types/proxy.index";

export async function loader({ request }: Route.LoaderArgs) {
	console.debug("routes/proxy.index#loader");

	await shopify.authenticate.public.appProxy(request);

	const data = {};
	return { data };
}

export default function ProxyIndex() {
	const { t } = useTranslation("proxy");

	return (
		<s-page inlineSize="small">
			<s-section heading={t("proxy")}>
				<Form data-save-bar method="POST" style={{ minWidth: "200px" }}>
					<s-text-field label="Input" name="input" placeholder="Input Value" />
					<s-button type="submit" variant="primary">
						{t("click")}
					</s-button>
				</Form>
			</s-section>
		</s-page>
	);
}

export async function action({ request }: Route.ActionArgs) {
	console.debug("routes/proxy.index#action");

	await shopify.authenticate.public.appProxy(request);

	const data = {};
	return { data };
}
