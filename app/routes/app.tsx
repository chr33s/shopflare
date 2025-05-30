import {NavMenu, useAppBridge} from '@shopify/app-bridge-react';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, Outlet, useNavigate, useNavigation} from 'react-router';

import {APP_BRIDGE_UI_URL, APP_BRIDGE_URL, APP_LINKS} from '~/const';
import * as shopify from '~/shopify.server';
import rootCss from '~/root.css?url';

import type {Route} from './+types/app';

export async function loader({context, request}: Route.LoaderArgs) {
	try {
		await shopify.admin(context, request);

		const config = shopify.config(context);
		return {
			appDebug: config.SHOPIFY_APP_LOG_LEVEL === 'debug',
			appHandle: config.SHOPIFY_APP_HANDLE,
			apiKey: config.SHOPIFY_API_KEY,
		};
	} catch (error: any) {
		if (error instanceof Response) return error;

		return new Response(error.message, {
			status: error.status,
			statusText: 'Unauthorized',
		});
	}
}

export default function App({loaderData}: Route.ComponentProps) {
	const {appHandle, apiKey} = loaderData;

	const navigate = useNavigate();
	useEffect(() => {
		const handleNavigate = (event: any) => {
			const href = event.target.getAttribute('href');
			if (href) navigate(href);
		};

		document.addEventListener('shopify:navigate', handleNavigate);
		return () => {
			document.removeEventListener('shopify:navigate', handleNavigate);
		};
	}, [navigate]);

	const shopify = useAppBridge();
	const navigation = useNavigation();
	const isNavigating =
		navigation.state !== 'idle' || Boolean(navigation.location);
	useEffect(() => {
		shopify.loading(isNavigating);
	}, [isNavigating, shopify]);

	const {t} = useTranslation();

	return (
		<>
			<script data-api-key={apiKey} src={APP_BRIDGE_URL} />
			<script src={APP_BRIDGE_UI_URL} />

			<NavMenu>
				<Link rel="home" to="/app">
					{t('app')}
				</Link>
				<Link
					target="_top"
					to={`shopify://admin/charges/${appHandle}/pricing_plans`}
				>
					{t('pricingPlans')}
				</Link>
			</NavMenu>

			<Outlet />
		</>
	);
}

export function ErrorBoundary(error: Route.ErrorBoundaryProps) {
	if (
		error.constructor.name === 'ErrorResponse' ||
		error.constructor.name === 'ErrorResponseImpl'
	) {
		return (
			<div
				dangerouslySetInnerHTML={{
					__html: (error as any).data || 'Handling response',
				}}
			/>
		);
	}

	throw error;
}
ErrorBoundary.displayName = 'AppErrorBoundary';

export function headers({
	parentHeaders,
	loaderHeaders,
	actionHeaders,
	errorHeaders,
}: Route.HeadersArgs) {
	if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
		return errorHeaders;
	}

	return new Headers([
		...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
		...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
		...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
	]);
}

export const links: Route.LinksFunction = () => [
	...APP_LINKS,
	{
		href: rootCss,
		precedence: 'default',
		rel: 'stylesheet',
	},
];

export const meta: Route.MetaFunction = ({data}: Route.MetaArgs) => [
	data?.appDebug ? {name: 'shopify-debug', content: 'web-vitals'} : {},
	{name: 'shopify-experimental-features', content: 'keepAlive'},
];
