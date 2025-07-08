import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { Button, Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data } from "react-router";

import { API_VERSION } from "~/const";
import { createShopify, ShopifyException } from "~/shopify.server";
import type { ShopQuery } from "~/types/admin.generated";
import type { Route } from "./+types/app.index";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("app.index.loader");

	const client = await shopify.admin(request);

	try {
		const { data, errors } = await client.request<ShopQuery>(/* GraphQL */ `
			#graphql
			query Shop {
				shop {
					name
				}
			}
		`);
		return {
			data,
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

		return data(
			{
				data: undefined,
				errors: [{ message: "Unknown Error" }],
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
		const controller = new AbortController();

		fetch(`shopify:admin/api/${API_VERSION}/graphql.json`, {
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
			signal: controller.signal,
		})
			.then<{ data: ShopQuery }>((res) => res.json())
			.then((res) => console.log("app.index.useEffect", res))
			.catch((err) => console.error("app.index.useEffect.error", err));

		return () => controller.abort();
	}, []);

	const shopify = useAppBridge();

	return (
		<Page title={t("app")}>
			<SaveBar id="savebar">
				<button onClick={() => shopify.saveBar.hide("savebar")} type="reset" />
				<button
					onClick={() => console.log("savebar.click.primary")}
					type="submit"
					variant="primary"
				/>
			</SaveBar>

			<Text as="p">
				{errors ? JSON.stringify(errors, null, 2) : data?.shop?.name}
			</Text>
			<Button onClick={() => shopify.saveBar.show("savebar")}>click</Button>
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

export { headers } from "./app";
