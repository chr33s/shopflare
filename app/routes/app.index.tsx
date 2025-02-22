import { Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data, useActionData, useLoaderData } from "react-router";

import type { Route } from "./+types/app.index";
import i18n from "~/i18n.server";
import { createShopify, ShopifyException } from "~/shopify.server";
import type { ShopQuery } from "~/types/admin.generated";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	console.debug("app.index.loader");

	const client = await shopify.authorize(request);

	try {
		const { data, errors } = await client.request(/* GraphQL */ `
			#graphql
			query Shop {
				shop {
					name
				}
			}
		`);
		return {
			data: data as ShopQuery,
			errors,
		};
	} catch (error) {
		console.error("app.index.loader.error", error);

		if (error instanceof ShopifyException && error?.type === "GRAPHQL") {
			return { errors: error.errors };
		}

		const t = await i18n.getFixedT(request);
		return data(
			{
				data: undefined,
				errors: [{ message: t("error") }],
			},
			500,
		);
	}
}

export default function AppIndex() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const { data, errors } = loaderData ?? actionData ?? {};
	console.log("app.index", data);

	const { t } = useTranslation();

	useEffect(() => {
		fetch("shopify:admin/api/graphql.json", {
			body: JSON.stringify({
				query: /* GraphQL */ `
					#graphql
					query Shop {
						shop {
							name
						}
					}
				`,
				variables: {},
			}),
			method: "POST",
		})
			.then((res) => res.json())
			.then((res) => console.log("app.index.useEffect", res))
			.catch((err) => console.error("app.index.useEffect.error", err));
	}, []);

	return (
		<Page title={t("app")}>
			<Text as="p">
				{errors ? JSON.stringify(errors, null, 2) : data?.shop?.name}
			</Text>
		</Page>
	);
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data };
}

export const handle = {
	i18n: "app",
};
