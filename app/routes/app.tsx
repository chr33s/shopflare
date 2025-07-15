import {useAppBridge} from '@shopify/app-bridge-react';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Outlet, useNavigate, useNavigation} from 'react-router';

import {
	API_KEY,
	APP_BRIDGE_UI_URL,
	APP_BRIDGE_URL,
	APP_HANDLE,
	APP_LINKS,
	APP_LOG_LEVEL,
} from '~/const';
import rootCss from '~/root.css?url';

import type {Route} from './+types/app';

export default function App() {
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
			<script data-api-key={API_KEY} src={APP_BRIDGE_URL} />
			<script src={APP_BRIDGE_UI_URL} />

			<ui-nav-menu>
				<a href="/" rel="home">
					{t('app')}
				</a>
				<a
					href={`shopify://admin/charges/${APP_HANDLE}/pricing_plans`}
					target="_top"
				>
					{t('pricingPlans')}
				</a>
			</ui-nav-menu>

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

export const meta: Route.MetaFunction = () => [
	APP_LOG_LEVEL === 'debug'
		? {name: 'shopify-debug', content: 'web-vitals'}
		: {},
	{name: 'shopify-experimental-features', content: 'keepAlive'},
];
