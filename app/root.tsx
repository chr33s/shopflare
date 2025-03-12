import "@shopify/polaris/build/esm/styles.css";
import { useTranslation } from "react-i18next";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteLoaderData,
} from "react-router";

import { getLocale } from "~/i18n.server";
import type { Route } from "./+types/root";

export async function loader({ context, request }: Route.LoaderArgs) {
	const locale = getLocale(request);
	return {
		appEnv: context.cloudflare.env.SHOPIFY_APP_ENV,
		locale,
	};
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main
			style={{
				alignItems: "center",
				display: "flex",
				height: "100vh",
				justifyContent: "center",
				width: "100vw",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<h1>{message}</h1>
				<p>{details}</p>
				{stack && (
					<pre>
						<code>{stack}</code>
					</pre>
				)}
			</div>
		</main>
	);
}
ErrorBoundary.displayName = "RootErrorBoundary";

export function Layout({ children }: { children: React.ReactNode }) {
	const { i18n } = useTranslation();

	const data = useRouteLoaderData<typeof loader>("root");

	return (
		<html dir={i18n.dir()} lang={data?.locale}>
			<head>
				<meta charSet="utf-8" />
				<meta content="initial-scale=1, width=device-width" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://cdn.shopify.com" },
	{
		rel: "stylesheet",
		href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css",
	},
	{ rel: "preconnect", href: "https://unpkg.com" },
];
