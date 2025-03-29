import { AppProvider, type AppProviderProps } from "@shopify/polaris";
import type {
	LinkLikeComponent,
	LinkLikeComponentProps,
} from "@shopify/polaris/build/ts/src/utilities/link";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router";

import { NavMenu } from "~/components/app-bridge";
import { APP_BRIDGE_URL } from "~/const";
import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/app";

export async function loader({ context, request }: Route.LoaderArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("app");

		await shopify.admin(request);

		return {
			apiKey: shopify.config.apiKey,
			appDebug: shopify.config.appLogLevel === "debug",
			appUrl: shopify.config.appUrl,
		};
		// biome-ignore lint/suspicious/noExplicitAny: catch(err)
	} catch (error: any) {
		if (error instanceof Response) return error;

		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}

export default function App({ loaderData }: Route.ComponentProps) {
	const { appUrl, apiKey } = loaderData;

	const { t } = useTranslation(["app", "polaris"]);
	const i18n = {
		Polaris: t("Polaris", {
			ns: "polaris",
			returnObjects: true,
		}),
	} as AppProviderProps["i18n"];

	return (
		<>
			<script data-api-key={apiKey} src={APP_BRIDGE_URL} />
			<script
				dangerouslySetInnerHTML={{
					__html: /* javascript */ `
						function processWebVitals(metrics) {
							const monitorUrl = "${appUrl}/shopify/web-vitals";
							const data = JSON.stringify(metrics);
							navigator.sendBeacon(monitorUrl, data);
						}

						// Register the callback
						shopify.webVitals.onReport(processWebVitals);
					`,
				}}
				type="text/javascript"
			/>

			<AppProvider i18n={i18n} linkComponent={ReactRouterPolarisLink}>
				<NavMenu>
					<Link rel="home" to="/app">
						{t("app")}
					</Link>
				</NavMenu>

				<Outlet />
			</AppProvider>
		</>
	);
}

export function ErrorBoundary(error: Route.ErrorBoundaryProps) {
	if (
		error.constructor.name === "ErrorResponse" ||
		error.constructor.name === "ErrorResponseImpl"
	) {
		return (
			<div
				dangerouslySetInnerHTML={{
					// biome-ignore lint/suspicious/noExplicitAny: upsteam
					__html: (error as any).data || "Handling response",
				}}
			/>
		);
	}

	throw error;
}
ErrorBoundary.displayName = "AppErrorBoundary";

export function headers({
	parentHeaders,
	loaderHeaders,
	actionHeaders,
	errorHeaders,
}: Route.HeadersArgs) {
	if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
		return errorHeaders;
	}

	return new Headers([
		...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
		...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
		...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
	]);
}

export const meta: Route.MetaFunction = ({ data }: Route.MetaArgs) => [
	data.appDebug ? { name: "shopify-debug", content: "web-vitals" } : {},
	{ name: "shopify-experimental-features", content: "keepAlive" },
];

export const ReactRouterPolarisLink = forwardRef<
	HTMLAnchorElement,
	LinkLikeComponentProps
>((props, ref) => (
	<Link {...props} ref={ref} to={props.url ?? props.to} />
)) as LinkLikeComponent;
ReactRouterPolarisLink.displayName = "ReactRouterPolarisLink";
