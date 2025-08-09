'use client';

import {useAppBridge} from '@shopify/app-bridge-react';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Outlet, useNavigate, useNavigation} from 'react-router';

import {APP_HANDLE} from '#app/const';

import type {Route} from './+types/app';

export function AppClient(_: Route.ComponentProps) {
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
