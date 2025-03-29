import { Button, Page, Text } from "@shopify/polaris";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data } from "react-router";

import Shop from "./app.index.graphql";

import {
	Modal,
	SaveBar,
	TitleBar,
	useAppBridge,
} from "~/components/app-bridge";
import { ShopifyException, createShopify } from "~/shopify.server";
import type { ShopQuery } from "~/types/admin.generated";
import type { Route } from "./+types/app.index";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("app.index.loader");

	const client = await shopify.admin(request);

	try {
		const { data, errors } = await client.request(Shop);
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
		fetch("shopify:admin/api/graphql.json", {
			body: JSON.stringify({
				query: Shop,
				variables: {},
			}),
			method: "POST",
		})
			.then((res) => res.json())
			.then((res) => console.log("app.index.useEffect", res))
			.catch((err) => console.error("app.index.useEffect.error", err));
	}, []);

	const shopify = useAppBridge();

	return (
		<Page title={t("app")}>
			<SaveBar id="savebar" open={true}>
				<button
					onClick={() => console.log("savebar.click.primary")}
					variant="primary"
				/>
				<button onClick={() => shopify.saveBar.hide("savebar")} />
			</SaveBar>

			<Modal id="modal" onShow={() => console.log("modal.onShow")} open={true}>
				<TitleBar title="Modal">
					<button onClick={() => shopify.modal.hide("modal")}>Discard</button>
					<button
						onClick={() => console.log("modal.click.primary")}
						variant="primary"
					>
						Save
					</button>
				</TitleBar>
				<p>Modal message</p>
			</Modal>

			<Text as="p">
				{errors ? JSON.stringify(errors, null, 2) : data?.shop?.name}
			</Text>
			<Button onClick={() => console.log("app.button.click")}>click</Button>
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
