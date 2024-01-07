import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import { useI18n } from "@/hooks";
import type { Component as Props } from "@/types";

export function AppBridgeProvider({ children }: Props) {
	const location = ReactRouter.useLocation();
	const navigate = ReactRouter.useNavigate();
	const history = React.useMemo(
		() => ({
			replace: (path: string) => {
				navigate(path, { replace: true });
			},
		}),
		[navigate],
	);

	const routerConfig = React.useMemo(
		() => ({ history, location }),
		[history, location],
	);

	const [appBridgeConfig] = React.useState(() => {
		const host =
			new URLSearchParams(location.search).get("host") ||
			window.__SHOPIFY_DEV_HOST;

		window.__SHOPIFY_DEV_HOST = host;

		return {
			host,
			apiKey: process.env.SHOPIFY_API_KEY ?? "",
			forceRedirect: true,
		};
	});

	const [i18n] = useI18n();

	const isShopPage = location.pathname === "/shop";
	if (isShopPage) {
		return <>{children}</>;
	}

	if (!process.env.SHOPIFY_API_KEY || !appBridgeConfig.host) {
		const bannerProps = !process.env.SHOPIFY_API_KEY
			? {
					title: i18n.translate("app.bridge.missingApiKey.title"),
					children: i18n.translate("app.bridge.missingApiKey.children"),
				}
			: {
					title: i18n.translate("app.bridge.missingHost.title"),
					children: i18n.translate("app.bridge.missingHost.children"),
				};

		return (
			<Polaris.Page narrowWidth>
				<Polaris.Layout>
					<Polaris.Layout.Section>
						<div style={{ marginTop: "100px" }}>
							<Polaris.Banner {...bannerProps} tone="critical" />
						</div>
					</Polaris.Layout.Section>
				</Polaris.Layout>
			</Polaris.Page>
		);
	}

	return (
		<AppBridge.Provider config={appBridgeConfig} router={routerConfig}>
			{children}
		</AppBridge.Provider>
	);
}
