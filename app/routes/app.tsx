import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useNavigation } from "react-router";

import { APP_HANDLE } from "#app/const";

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
		<>
			<s-app-nav>
				<s-link href="/" rel="home">
					{t("app")}
				</s-link>
				<s-link href={`shopify://admin/charges/${APP_HANDLE}/pricing_plans`} target="_top">
					{t("pricingPlans")}
				</s-link>
			</s-app-nav>

			<Outlet />
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
}: Partial<Route.HeadersArgs>) {
	if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
		return errorHeaders;
	}

	return new Headers([
		...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
		...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
		...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
	]);
}
