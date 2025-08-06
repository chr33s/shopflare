import type {PropsWithChildren} from 'react';
import {useTranslation} from 'react-i18next';
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';

import {
	API_KEY,
	APP_BRIDGE_UI_URL,
	APP_BRIDGE_URL,
	APP_LOG_LEVEL,
	SHOPIFY_CDN,
} from '#app/const';
import rootCss from '#app/root.css?url';
import type {Route} from './+types/root';

export default function Component() {
	return <Outlet />;
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
	let title = '500 Error';
	let message = 'An unexpected error occurred.';
	if (isRouteErrorResponse(error)) {
		title = `${error.status} Error`;
		message = error.data?.message ?? error.statusText ?? message;
	}

	let stack: string | undefined;
	if (import.meta.env.DEV && error instanceof Error) {
		message = error.message;
		stack = error.stack;
	}

	return (
		<s-page inlineSize="small">
			<s-section heading={title}>
				<p>{message}</p>
				{stack && (
					<pre>
						<code>{stack}</code>
					</pre>
				)}
			</s-section>
		</s-page>
	);
}
ErrorBoundary.displayName = 'RootErrorBoundary';

export function Layout({children}: PropsWithChildren) {
	const {i18n} = useTranslation();

	return (
		<html dir={i18n.dir()} lang={i18n.language} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta content="initial-scale=1, width=device-width" name="viewport" />
				<meta name="shopify-api-key" content={API_KEY} />
				<meta name="description" content="..." />
				{APP_LOG_LEVEL === 'debug' && (
					<meta name="shopify-debug" content="web-vitals" />
				)}
				<meta name="shopify-experimental-features" content="keepAlive" />
				<link href={SHOPIFY_CDN} rel="preconnect" />
				<script src={APP_BRIDGE_URL} rel="preload" />
				<script src={APP_BRIDGE_UI_URL} rel="preload" />
				<title>ShopFlare</title>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<link
					href={`${SHOPIFY_CDN}/static/fonts/inter/v4/styles.css`}
					precedence="default"
					rel="stylesheet"
				/>
				<link href={rootCss} precedence="default" rel="stylesheet" />
			</body>
		</html>
	);
}
