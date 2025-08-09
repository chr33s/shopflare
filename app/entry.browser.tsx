import {
	createFromReadableStream,
	createTemporaryReferenceSet,
	encodeReply,
	setServerCallback,
} from '@vitejs/plugin-rsc/browser';
import i18next from 'i18next';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot, type HydrationOptions} from 'react-dom/client';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import {
	unstable_createCallServer as createCallServer,
	unstable_getRSCStream as getRSCStream,
	unstable_RSCHydratedRouter as RSCHydratedRouter,
	type unstable_RSCPayload as RSCServerPayload,
} from 'react-router';

import i18n, {LanguageDetector} from './i18n';

setServerCallback(
	createCallServer({
		createFromReadableStream,
		createTemporaryReferenceSet,
		encodeReply,
	}),
);

// eslint-disable-next-line promise/catch-or-return
createFromReadableStream<RSCServerPayload>(getRSCStream()).then((payload) => {
	startTransition(async () => {
		await i18next
			.use(initReactI18next)
			.use(LanguageDetector)
			.init({
				...i18n,
				detection: {
					searchParams: new URL(window.location.href).searchParams,
				},
			});

		const formState = (
			payload.type === 'render' ? await payload.formState : undefined
		) as HydrationOptions['formState'];

		hydrateRoot(
			document,
			<StrictMode>
				<I18nextProvider i18n={i18next}>
					<RSCHydratedRouter
						createFromReadableStream={createFromReadableStream}
						payload={payload}
					/>
				</I18nextProvider>
			</StrictMode>,
			{formState},
		);
	});
});
