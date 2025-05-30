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

import {APP_BRIDGE_URL, APP_LINKS} from '~/const';
import rootCss from '~/root.css?url';

import type {Route} from './+types/root';

export default function App() {
	return <Outlet />;
}

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

export const meta: Route.MetaFunction = ({data}: Route.MetaArgs) => [
	{title: 'ShopFlare'},
	{name: 'description', content: '...'},
];
