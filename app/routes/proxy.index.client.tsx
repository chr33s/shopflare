'use client';

import {useTranslation} from 'react-i18next';

import {Form} from '#app/components/proxy';

import type {Route} from './+types/proxy.index';

export function ProxyIndexClient(_: Route.ComponentProps) {
	const {t} = useTranslation('proxy');

	return (
		<s-page inlineSize="small">
			<s-section heading={t('proxy')}>
				<Form data-save-bar method="POST" style={{minWidth: '200px'}}>
					<s-text-field label="Input" name="input" placeholder="Input Value" />
					<s-button type="submit" variant="primary">
						{t('click')}
					</s-button>
				</Form>
			</s-section>
		</s-page>
	);
}
