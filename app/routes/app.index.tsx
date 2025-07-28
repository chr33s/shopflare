import {useAppBridge} from '@shopify/app-bridge-react';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useFetcher} from 'react-router';

import {API_VERSION} from '#app/const';
import Shop from '#app/graphql/query.shop.gql?raw';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';
import type {ShopQuery} from '#app/types/admin.generated';

import type {Route} from './+types/app.index';

export async function loader({context, request}: Route.LoaderArgs) {
	return shopify.handler(async () => {
		const {client} = await shopify.admin(context, request);

		const {data, errors} = await client.request<ShopQuery>(Shop);

		log.debug('routes/app.index#loader', {data, errors});

		return {
			data,
			errors,
		};
	});
}

export async function clientLoader({serverLoader}: Route.ClientLoaderArgs) {
	const data = await serverLoader();
	log.debug('routes/app.index#clientLoader', {data});
	return data;
}

export default function AppIndex({
	actionData,
	loaderData,
}: Route.ComponentProps) {
	const {data, errors} = loaderData ?? actionData ?? {};
	log.debug('routes/app.index#component', data);

	const {t} = useTranslation();

	useEffect(() => {
		const controller = new AbortController();

		fetch(`shopify:admin/api/${API_VERSION}/graphql.json`, {
			body: JSON.stringify({
				query: Shop,
				variables: {},
			}),
			method: 'POST',
			signal: controller.signal,
		})
			.then<{data: ShopQuery}>((res) => res.json())
			.then((res) => log.debug('routes/app.index#component.useEffect', res))
			.catch((err) => log.error('routes/app.index#component.useEffect', err));

		return () => controller.abort();
	}, []);

	const fetcher = useFetcher();

	const shopify = useAppBridge();

	const debug = errors ? JSON.stringify(errors, null, 2) : data?.shop?.name;

	return (
		<s-page inlineSize="small">
			<ui-title-bar title={t('app')}>
				<button
					onClick={() => shopify.modal.show('modal')}
					type="button"
					variant="primary"
				>
					{t('primary')}
				</button>
			</ui-title-bar>
			<ui-modal id="modal">
				<s-box padding="base">
					<s-paragraph>{t('message')}</s-paragraph>
				</s-box>
				<ui-title-bar title={t('title')}>
					<button onClick={() => shopify.modal.hide('modal')} type="button">
						{t('close')}
					</button>
				</ui-title-bar>
			</ui-modal>

			<s-section>
				<s-paragraph>{debug}</s-paragraph>
				<fetcher.Form
					data-save-bar
					method="POST"
					onReset={(ev) => {
						log.debug('routes/app.index#component.onReset', ev);
						ev.currentTarget.reset();
						shopify.saveBar.hide('savebar');
					}}
					onSubmit={(ev) => {
						const formData = new FormData(ev.currentTarget);
						log.debug(
							'routes/app.index#component.onSubmit',
							Object.fromEntries(formData),
						);
						fetcher.submit(formData, {method: 'POST'});
					}}
				>
					<ui-save-bar id="savebar">
						<button type="reset">{t('reset')}</button>
						<button type="submit" variant="primary">
							{t('submit')}
						</button>
					</ui-save-bar>
					<s-text-field label="Input" name="input" placeholder="Input Value" />
				</fetcher.Form>
			</s-section>
		</s-page>
	);
}

export async function clientAction({serverAction}: Route.ClientActionArgs) {
	const data = await serverAction();
	log.debug('routes/app.index#clientAction', data);
	return data;
}

export async function action({context, request}: Route.ActionArgs) {
	await shopify.admin(context, request);

	const data = Object.fromEntries(await request.formData());
	log.debug('routes/app.index#action', {data});
	return {data};
}

export {headers} from './app';
