import Backend from "i18next-fetch-backend";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n";

const i18next = new RemixI18Next({
	detection: {
		fallbackLanguage: i18n.fallbackLng,
		async findLocale(request) {
			const url = new URL(request.url);
			let locale = url.searchParams.get("locale")?.split("-").at(0); // shopify admin
			if (!locale) {
				locale = request.headers.get("accept-language")?.split(",").at(0); // shopify storefront proxy
			}
			if (!locale) {
				locale = i18n.fallbackLng;
			}
			return locale;
		},
		supportedLanguages: i18n.supportedLngs,
	},
	i18next: { ...i18n },
	plugins: [Backend],
});

export default i18next;
