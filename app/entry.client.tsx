import i18next from "i18next";
import Backend from "i18next-fetch-backend";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import { getInitialNamespaces } from "remix-i18next/client";

import i18n from "./i18n";

async function hydrate() {
	await i18next
		.use(initReactI18next)
		.use(Backend)
		.init({
			...i18n,
			ns: getInitialNamespaces(),
			detection: {
				caches: [],
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
	window.setTimeout(hydrate, 1);
}
