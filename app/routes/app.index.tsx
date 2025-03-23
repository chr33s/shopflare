import { Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data } from "react-router";

import { getFixedT } from "~/i18n.server";
import { ShopifyException, createShopify } from "~/shopify.server";
import type { ShopQuery } from "~/types/admin.generated";
import type { Route } from "./+types/app.index";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("app.index.loader");

	const client = await shopify.admin(request);

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
		shopify.utils.log.error("app.index.loader.error", error);

		if (error instanceof ShopifyException) {
			switch (error.type) {
				case "GRAPHQL":
					return { errors: error.errors };

				default:
					return new Response(error.message, {
						status: error.status,
					});
			}
		}

		const t = await getFixedT(request, "app");
		return data(
			{
				data: undefined,
				errors: [{ message: t("error") }],
			},
			500,
		);
	}
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	const data = await serverLoader();
	return data;
}

export default function AppIndex({
	actionData,
	loaderData,
}: Route.ComponentProps) {
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
				<button onClick={() => console.log("app.click")}>click</button>
			</Text>
		</Page>
	);
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
	const data = await serverAction();
	return data;
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data };
}
