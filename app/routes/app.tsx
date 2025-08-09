import type {Route} from './+types/app';
import {AppClient} from './app.client';

export default function App(props: Route.ComponentProps) {
	return <AppClient {...props} />;
}

export {ErrorBoundary} from './app.client';

export function headers({
	parentHeaders,
	loaderHeaders,
	actionHeaders,
	errorHeaders,
}: Partial<Route.HeadersArgs>) {
	if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
		return errorHeaders;
	}

	return new Headers([
		...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
		...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
		...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
	]);
}
