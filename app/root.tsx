import type {PropsWithChildren} from 'react';
import {useTranslation} from 'react-i18next';
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from 'react-router';

import {APP_BRIDGE_URL, APP_LINKS, APP_LOG_LEVEL} from '#app/const';
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
		message = error.data.message ?? error.statusText ?? message;
	}

	let stack: string | undefined;
	if (import.meta.env.DEV && error instanceof Error) {
		message ??= error.message;
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
	...APP_LINKS.filter((link) => link.href !== APP_BRIDGE_URL),
	{
		href: rootCss,
		precedence: 'default',
		rel: 'stylesheet',
	},
];

export const meta: Route.MetaFunction = () => [
	{title: 'ShopFlare'},
	{name: 'description', content: '...'},
	APP_LOG_LEVEL === 'debug'
		? {name: 'shopify-debug', content: 'web-vitals'}
		: {},
	{name: 'shopify-experimental-features', content: 'keepAlive'},
];
