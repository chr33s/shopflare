import { Page, Text } from "@shopify/polaris";
import { GraphqlQueryError } from "@shopify/shopify-api";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data, useActionData, useLoaderData } from "react-router";

import type { Route } from "./+types/app.index";
import i18n from "~/i18n.server";
import { createShopify } from "~/shopify.server";
import type { ShopQuery } from "~/types/admin.generated";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.api.logger.debug("app.index");

	const client = await shopify.authorize(request);

	try {
		const { data } = await client.request(/* GraphQL */ `
			#graphql
			query Shop {
				shop {
					name
				}
			}
		`);
		return { data: data as ShopQuery };
	} catch (error) {
		console.error("app.index.error", error);

		if (error instanceof GraphqlQueryError) {
			return { errors: error.body?.errors };
		}

		const t = await i18n.getFixedT(request);
		return data({ errors: [{ message: t("error") } ]}, 500);
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
			.then(console.log)
			.catch(console.error);
	}, []);

	return (
		<Page title={t("app")}>
			<Text as="p">{errors?.length ? JSON.stringify(errors, null, 2) : data?.shop?.name}</Text>
		</Page>
	)
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data }
}

export let handle = {
  i18n: "app",
};