import {useTranslation} from 'react-i18next';

import {Form} from '~/components/proxy';
import * as shopify from '~/shopify.server';
import {log} from '~/shopify.shared';

import type {Route} from './+types/proxy.index';

export async function loader({context, request}: Route.LoaderArgs) {
	try {
		log.debug('routes/app.proxy.index#loader');

		await shopify.proxy(context, request);

		const data = {};
		return {data};
	} catch (error: any) {
		throw new Response(error.message, {
			status: error.status ?? 500,
			statusText: 'Unauthorized',
		});
	}
}

export default function ProxyIndex() {
	const {t} = useTranslation('proxy');

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				height: '100vh',
				justifyContent: 'center',
				width: '100vw',
			}}
		>
			<h1>{t('proxy')}</h1>
			<Form action="">
				<button
					onClick={() => log.debug('routes/proxy.index#component.proxy.click')}
					type="button"
				>
					{t('click')}
				</button>
			</Form>
		</div>
	);
}

export async function action(_: Route.ActionArgs) {
	log.debug('routes/proxy.index#action');

	const data = {};
	return {data};
}
