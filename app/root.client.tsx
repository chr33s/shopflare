'use client';

import type {PropsWithChildren} from 'react';
import {useTranslation} from 'react-i18next';
import {isRouteErrorResponse} from 'react-router';

import {APP_BRIDGE_UI_URL, APP_BRIDGE_URL, APP_LOG_LEVEL} from '#app/const';

import type {Route} from './+types/root';

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main
			style={{
				alignItems: 'center',
				display: 'flex',
				height: '100vh',
				justifyContent: 'center',
				width: '100vw',
			}}
		>
			<div style={{textAlign: 'center'}}>
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
ErrorBoundary.displayName = 'RootErrorBoundary';

export function Component({children}: PropsWithChildren) {
	const {i18n} = useTranslation();

	return (
		<html dir={i18n.dir()} lang={i18n.language} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta content="initial-scale=1, width=device-width" name="viewport" />
				<meta content="..." name="description" />
				<link rel="preconnect" href="https://cdn.shopify.com" />
				{APP_LOG_LEVEL === 'debug' && (
					<meta name="shopify-debug" content="web-vitals" />
				)}
				<meta name="shopify-experimental-features" content="keepAlive" />
				<link
					href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
					precedence="default"
					rel="stylesheet"
				/>
				<script rel="preload" src={APP_BRIDGE_URL} />
				<script async rel="preload" src={APP_BRIDGE_UI_URL} />
				<title>ShopFlare</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
