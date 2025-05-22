import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { data, useFetcher } from "react-router";

import { API_VERSION } from "~/const";
import { ShopifyException, createShopify } from "~/shopify.server";
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

		console.log("loader", { data, errors });

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
	console.log("clientLoader", data);
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

	const fetcher = useFetcher();

	const shopify = useAppBridge();

	return (
		<s-page inlineSize="small">
			<ui-title-bar title={t("app")}>
				<button
					onClick={() => shopify.modal.show("modal")}
					type="button"
					variant="primary"
				>
					Primary
				</button>
			</ui-title-bar>
			<ui-modal id="modal">
				<s-box padding="base">
					<s-paragraph>Message</s-paragraph>
				</s-box>
				<ui-title-bar title="Title">
					<button onClick={() => shopify.modal.hide("modal")} type="button">
						Close
					</button>
				</ui-title-bar>
			</ui-modal>

			<s-section>
				<s-paragraph>
					{errors ? JSON.stringify(errors, null, 2) : data?.shop?.name}
				</s-paragraph>
				<fetcher.Form
					data-save-bar
					method="POST"
					onReset={(ev) => {
						console.log("onReset", ev);
						ev.currentTarget.reset();
						shopify.saveBar.hide("savebar");
					}}
					onSubmit={(ev) => {
						const formData = new FormData(ev.currentTarget);
						console.log("onSubmit", Object.fromEntries(formData));
						fetcher.submit(formData, { method: "POST" });
					}}
				>
					<ui-save-bar id="savebar">
						<button type="reset" />
						<button type="submit" variant="primary" />
					</ui-save-bar>
					<s-text-field label="Input" name="input" placeholder="Input Value" />
				</fetcher.Form>
			</s-section>
		</s-page>
	);
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
	const data = await serverAction();
	console.log("clientAction", data);
	return data;
}

export async function action({ request }: Route.ActionArgs) {
	const data = Object.fromEntries(await request.formData());
	console.log("action", { data });
	return { data };
}

export { headers } from "./app";
