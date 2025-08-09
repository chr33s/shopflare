import type {PropsWithChildren} from 'react';
import {Outlet} from 'react-router';

import {Component as Client} from './root.client';
import './root.css';

export default function Component() {
	return <Outlet />;
}

export {ErrorBoundary} from './root.client';

export function Layout({children}: PropsWithChildren) {
	return <Client>{children}</Client>;
}
