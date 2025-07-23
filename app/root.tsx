import type {PropsWithChildren} from 'react';
import {Outlet} from 'react-router';

import type {Route} from './+types/root';
import {Component as Client} from './root.client';

import './root.css';

export default function Component() {
	return <Outlet />;
}

export {ErrorBoundary} from './root.client';

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

export function Layout({children}: PropsWithChildren) {
	return <Client>{children}</Client>;
}
