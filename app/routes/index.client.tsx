'use client';

import {useTranslation} from 'react-i18next';
import {Form} from 'react-router';

import type {Route} from './+types/index';

export function Component({actionData, loaderData}: Route.ComponentProps) {
	const {errors} = actionData ?? loaderData ?? {};

	const {t} = useTranslation();

	return (
		<s-page inlineSize="small">
			<s-section heading={t('login')}>
				<Form method="post" style={{minWidth: '200px'}}>
					<s-stack gap="base">
						<s-text-field
							error={errors?.shop}
							label={t('shopDomain')}
							name="shop"
							placeholder="example.myshopify.com"
						/>
						<s-button type="submit" variant="primary">
							{t('login')}
						</s-button>
					</s-stack>
				</Form>
			</s-section>
		</s-page>
	);
}
