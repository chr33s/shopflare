import * as AppBridge from "@shopify/app-bridge-react";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

import {
	AppBridgeProvider,
	QueryProvider,
	PolarisProvider,
} from "@/components";

const HomePage = React.lazy(() => import("./pages"));
const ExitIframePage = React.lazy(() => import("./pages/ExitIframe"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound"));
const ShopPage = React.lazy(() => import("./pages/Shop"));

export default function App() {
	return (
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
	const links: string[] = [];
	const toUrl = React.useCallback(
		(link: string) => `/${link.toLocaleLowerCase().replace(/\s/g, "-")}`,
		[]
	);
	const navigationLinks = links.map((link: any) => ({
		label: link,
		destination: toUrl(link),
	}));
	const { pathname } = ReactRouter.useLocation();
	const matcher = React.useCallback(
		(link: any, location: any) => link.destination === location.pathname,
		[pathname]
	);

	const isShopPage = pathname === "/shop";
	if (isShopPage) {
		return null;
	}

	return (
		<AppBridge.NavigationMenu
			matcher={matcher}
			navigationLinks={navigationLinks}
		/>
	);
}

function Routes() {
	return (
		<ReactRouter.Routes>
			<ReactRouter.Route element={<HomePage />} path="/" />
			<ReactRouter.Route element={<ExitIframePage />} path="/exitiframe" />
			<ReactRouter.Route element={<ShopPage />} path="/shop" />
			<ReactRouter.Route element={<NotFoundPage />} path="*" />
		</ReactRouter.Routes>
	);
}
