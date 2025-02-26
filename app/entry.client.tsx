import * as Sentry from "@sentry/react-router";
import i18next from "i18next";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import i18n, { LanguageDetector } from "./i18n";

Sentry.init({
	dsn: import.meta.env.SENTRY_DSN,
	environment: import.meta.env.ENVIRONMENT,
	release: import.meta.env.VERSION,
});

async function hydrate() {
	await i18next
		.use(initReactI18next)
		.use(LanguageDetector)
		.init({
			...i18n,
			detection: {
				searchParams: new URL(window.location.href).searchParams,
			},
		});

	startTransition(() => {
		hydrateRoot(
			document,
			<I18nextProvider i18n={i18next}>
				<StrictMode>
					<HydratedRouter />
				</StrictMode>
			</I18nextProvider>,
		);
	});
}

if (window.requestIdleCallback) {
	window.requestIdleCallback(hydrate);
} else {
	// Safari doesn't support requestIdleCallback
	// https://caniuse.com/requestidlecallback
	window.setTimeout(hydrate, 1);
}
