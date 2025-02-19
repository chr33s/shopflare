import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";

import i18nConfig from "~/i18n";
import i18n from "~/i18n.server"

import type { Route } from "./+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await i18n.getLocale(request);
	return { locale };
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
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

	const data = useRouteLoaderData<typeof loader>("root");
	const locale = data?.locale ?? i18nConfig.fallbackLng;
  useChangeLanguage(locale);

	return (
		<html dir={i18n.dir()} lang={locale}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
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
	{
		rel: "stylesheet",
		href: "https://cdn.jsdelivr.net/npm/@shopify/polaris@13.9.2/build/esm/styles.css",
	},
];

export let handle = {
  i18n: "app",
};