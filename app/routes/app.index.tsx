import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { API_VERSION } from "#app/const";
import Shop from "#app/graphql/query.shop.gql?raw";
import { shopify } from "#app/shopify.server";
import type { ShopQuery } from "#app/types/admin.generated";
import type { Route } from "./+types/app.index";

export async function loader({ request }: Route.LoaderArgs) {
	const { admin } = await shopify.authenticate.admin(request);

	const response = await admin.graphql(Shop);
	const { data } = await response.json();

	console.debug("routes/app.index#loader", { data });

	return { data };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	const data = await serverLoader();
	console.debug("routes/app.index#clientLoader", { data });
	return data;
}

export default function AppIndex({ actionData, loaderData }: Route.ComponentProps) {
	const { data } = (actionData ?? loaderData)!;
	console.debug("routes/app.index#component", data);

	const { t } = useTranslation();

	useEffect(() => {
		const controller = new AbortController();

		fetch(`shopify:admin/api/${API_VERSION}/graphql.json`, {
			body: JSON.stringify({
				query: Shop,
				variables: {},
			}),
			method: "POST",
			signal: controller.signal,
		})
			.then<{ data: ShopQuery }>((res) => res.json())
			.then((res) => console.debug("routes/app.index#component.useEffect", res))
			.catch((err) => console.error("routes/app.index#component.useEffect", err));

		return () => controller.abort();
	}, []);

	const fetcher = useFetcher();

	const debug = data?.shop.name;

	return (
		<s-page inlineSize="small" heading={t("app")}>
			<s-button
				commandFor="modal"
				command="--show"
				slot="primary-action"
				suppressHydrationWarning
				type="submit"
				variant="primary"
			>
				{t("primary")}
			</s-button>

			<s-modal accessibilityLabel={t("message")} heading={t("message")} id="modal">
				<s-button
					commandFor="modal"
					command="--hide"
					slot="secondary-actions"
					suppressHydrationWarning
				>
					{t("close")}
				</s-button>
				<s-box padding="base">
					<s-paragraph>{t("message")}</s-paragraph>
				</s-box>
			</s-modal>

			<s-section>
				<s-paragraph>{debug}</s-paragraph>
				<fetcher.Form
					data-save-bar
					method="POST"
					onReset={(ev) => {
						console.debug("routes/app.index#component.onReset", ev);
						ev.currentTarget.reset();
						void window.shopify.saveBar.hide("savebar");
					}}
					onSubmit={(ev) => {
						const formData = new FormData(ev.currentTarget);
						console.debug("routes/app.index#component.onSubmit", Object.fromEntries(formData));
						void fetcher.submit(formData, { method: "POST" });
					}}
				>
					<ui-save-bar id="savebar">
						<button type="reset">{t("reset")}</button>
						<button type="submit" variant="primary">
							{t("submit")}
						</button>
					</ui-save-bar>
					<s-text-field label="Input" name="input" placeholder="Input Value" />
				</fetcher.Form>
			</s-section>
		</s-page>
	);
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
	const data = await serverAction();
	console.debug("routes/app.index#clientAction", data);
	return data;
}

export async function action({ request }: Route.ActionArgs) {
	await shopify.authenticate.admin(request);

	const data = Object.fromEntries(await request.formData());
	console.debug("routes/app.index#action", { data });
	return {
		// SILENCE types through case
		data: data as unknown as ShopQuery,
		errors: null,
	};
}

export { headers } from "./app";
