import {createRoutesStub} from 'react-router';
import {expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

import Index from './index';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (i18nKey: string) => i18nKey,
		i18n: {
			changeLanguage: () => new Promise(() => {}),
		},
	}),
	initReactI18next: {
		type: '3rdParty',
		init: () => {},
	},
}));

test('loads and displays h1', async () => {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: Index as any,
			action() {
				return {};
			},
		},
	]);

	const screen = render(<Stub initialEntries={['/']} />);
	const label = screen.getByText('login');
	await expect.element(label).toBeVisible();
});
