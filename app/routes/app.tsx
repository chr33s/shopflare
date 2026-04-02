import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useNavigation, type HeadersFunction } from "react-router";
import { API_KEY, APP_HANDLE } from "#app/const";
import type { Route } from "./+types/app";

export default function App() {
	const navigate = useNavigate();
	useEffect(() => {
		const handleNavigate = (event: any) => {
			const href = event.target.getAttribute("href");
			if (href) void navigate(href);
		};

		document.addEventListener("shopify:navigate", handleNavigate);
		return () => {
			document.removeEventListener("shopify:navigate", handleNavigate);
		};
	}, [navigate]);

	const navigation = useNavigation();
	const isNavigating = navigation.state !== "idle" || Boolean(navigation.location);
	useEffect(() => {
		window.shopify.loading(isNavigating);
	}, [isNavigating]);

	const { t } = useTranslation();

	return (
		<AppProvider embedded apiKey={API_KEY}>
			<s-app-nav>
				<s-link href="/" rel="home">
					{t("app")}
				</s-link>
				<s-link href={`shopify://admin/charges/${APP_HANDLE}/pricing_plans`} target="_top">
					{t("pricingPlans")}
				</s-link>
			</s-app-nav>

			<Outlet />
		</AppProvider>
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
					__html: (error as any).data || "Handling response",
				}}
			/>
		);
	}

	throw error;
}
ErrorBoundary.displayName = "AppErrorBoundary";

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
