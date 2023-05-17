import * as AppBridge from "@shopify/app-bridge-react";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import {
	AppBridgeProvider,
	I18nProvider,
	QueryProvider,
	PolarisProvider,
} from "@/components";
import { useI18n } from "@/hooks";

const HomePage = React.lazy(() => import("./pages"));
const ExitIframePage = React.lazy(() => import("./pages/ExitIframe"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const ShopPage = React.lazy(() => import("./pages/Shop"));

export default function App() {
	return (
		<I18nProvider>
			<PolarisProvider>
				<ReactRouter.BrowserRouter>
					<AppBridgeProvider>
						<React.Suspense fallback={<Loading />}>
							<QueryProvider>
								<NavigationMenu />
								<Routes />
							</QueryProvider>
						</React.Suspense>
					</AppBridgeProvider>
				</ReactRouter.BrowserRouter>
			</PolarisProvider>
		</I18nProvider>
	);
}

function Loading() {
	const { pathname } = ReactRouter.useLocation();
	const isShopPage = pathname === "/shop";
	if (isShopPage) {
		return null;
	}

	return <AppBridge.Loading />;
}

function NavigationMenu() {
	const { pathname } = ReactRouter.useLocation();
	const matcher = React.useCallback(
		(link: any, location: any) => link.destination === location.pathname,
		[pathname]
	);

	const [i18n] = useI18n();

	const isShopPage = pathname === "/shop";
	if (isShopPage) {
		return null;
	}

	return (
		<AppBridge.NavigationMenu
			matcher={matcher}
			navigationLinks={[
				{
					label: i18n.translate("app.settings.title"),
					destination: "/settings",
				},
			]}
		/>
	);
}

function Routes() {
	return (
		<ReactRouter.Routes>
			<ReactRouter.Route element={<HomePage />} path="/" />
			<ReactRouter.Route element={<ExitIframePage />} path="/exitiframe" />
			<ReactRouter.Route element={<SettingsPage />} path="/settings" />
			<ReactRouter.Route element={<ShopPage />} path="/shop" />
			<ReactRouter.Route element={<NotFoundPage />} path="*" />
		</ReactRouter.Routes>
	);
}
