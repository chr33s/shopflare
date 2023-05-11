import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

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
		[navigate]
	);

	const routerConfig = React.useMemo(
		() => ({ history, location }),
		[history, location]
	);

	const [appBridgeConfig] = React.useState(() => {
		const host =
			new URLSearchParams(location.search).get("host") ||
			window.__SHOPIFY_DEV_HOST;

		window.__SHOPIFY_DEV_HOST = host;

		return {
			host,
			apiKey: process.env.SHOPIFY_API_KEY!,
			forceRedirect: true,
		};
	});

	const isShopPage = location.pathname === "/shop";
	if (isShopPage) {
		return <>{children}</>;
	}

	if (!process.env.SHOPIFY_API_KEY || !appBridgeConfig.host) {
		const bannerProps = !process.env.SHOPIFY_API_KEY
			? {
					title: "Missing Shopify API Key",
					children: (
						<>
							Your app is running without the SHOPIFY_API_KEY environment
							variable. Please ensure that it is set when running or building
							your React app.
						</>
					),
			  }
			: {
					title: "Missing host query argument",
					children: (
						<>
							Your app can only load if the URL has a <b>host</b> argument.
							Please ensure that it is set, or access your app using the
							Partners Dashboard <b>Test your app</b> feature
						</>
					),
			  };

		return (
			<Polaris.Page narrowWidth>
				<Polaris.Layout>
					<Polaris.Layout.Section>
						<div style={{ marginTop: "100px" }}>
							<Polaris.Banner {...bannerProps} status="critical" />
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
