import {
	AppProvider,
	type AppProviderProps,
	Button,
	FormLayout,
	Page,
	Text,
	TextField,
} from "@shopify/polaris";
import polarisCss from "@shopify/polaris/build/esm/styles.css?url";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";

import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/shopify.auth.login";

export async function loader({ context, request }: Route.LoaderArgs) {
	return action({ context, request } as Route.ActionArgs);
}

export default function AuthLogin({
	actionData,
	loaderData,
}: Route.ComponentProps) {
	const { errors } = actionData ?? loaderData ?? {};
	const [shop, setShop] = useState("");

	const { t } = useTranslation(["app", "polaris"]);
	const i18n = {
		Polaris: t("Polaris", {
			ns: "polaris",
			returnObjects: true,
		}),
	} as AppProviderProps["i18n"];

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
			<AppProvider i18n={i18n}>
				<Page narrowWidth>
					<Form method="post">
						<FormLayout>
							<Text as="h2" variant="headingMd">
								{t("login")}
							</Text>
							<TextField
								autoComplete="on"
								error={errors?.shop}
								label={t("shopDomain")}
								name="shop"
								onChange={setShop}
								pattern="^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$"
								placeholder="example.myshopify.com"
								type="text"
								value={shop}
							/>
							<Button submit variant="primary">
								{t("login")}
							</Button>
						</FormLayout>
					</Form>
				</Page>
			</AppProvider>
		</div>
	);
}

export async function action({ context, request }: Route.ActionArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);
	let shop = url.searchParams.get("shop");
	if (request.method === "GET" && !shop) {
		return {};
	}

	if (!shop) {
		shop = (await request.formData()).get("shop") as string;
	}
	if (!shop) {
		return { errors: { shop: "MISSING_SHOP" } };
	}

	const shopWithoutProtocol = shop
		.replace(/^https?:\/\//, "")
		.replace(/\/$/, "");
	const shopWithDomain =
		shop?.indexOf(".") === -1
			? `${shopWithoutProtocol}.myshopify.com`
			: shopWithoutProtocol;
	const sanitizedShop = shopify.utils.sanitizeShop(shopWithDomain);
	if (!sanitizedShop) {
		return { errors: { shop: "INVALID_SHOP" } };
	}

	const adminPath = shopify.utils.legacyUrlToShopAdminUrl(sanitizedShop);
	const redirectUrl = `https://${adminPath}/oauth/install?client_id=${shopify.config.apiKey}`;
	throw redirect(redirectUrl);
}

export const links: Route.LinksFunction = () => [
	{ href: "https://cdn.shopify.com", rel: "preconnect" },
	{
		href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css",
		precedence: "default",
		rel: "stylesheet",
	},
	{ href: polarisCss, precedence: "high", rel: "stylesheet" },
];
