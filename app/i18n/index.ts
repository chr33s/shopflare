import resources from 'virtual:i18next-loader';
import type {InitOptions, LanguageDetectorModule, Services} from 'i18next';

const i18n = {
	debug: false,
	defaultNS: 'app',
	fallbackLng: 'en',
	interpolation: {
		// react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
		escapeValue: false,
	},
	ns: ['app', 'proxy'],
	resources,
	supportedLngs: ['en'],
} satisfies InitOptions;

export default i18n;

export interface DetectorOptions {
	headers: Headers;
	searchParams: URLSearchParams;
}

export class LanguageDetector implements LanguageDetectorModule {
	static type = 'languageDetector' as const;
	public type = 'languageDetector' as const;

	#options: DetectorOptions;
	#i18n: InitOptions;

	constructor(
		_services: Services,
		detectorOptions: DetectorOptions,
		initOptions: InitOptions,
	) {
		this.#options = detectorOptions;
		this.#i18n = initOptions;
	}

	public detect() {
		let locale: string | null | undefined;

		const param = 'locale';
		if (this.#options?.searchParams?.has(param)) {
			// shopify admin
			locale = this.#options.searchParams.get(param);
		}

		const header = 'accept-language';
		if (!locale && this.#options?.headers?.has(header)) {
			// shopify storefront
			locale = this.#options?.headers
				.get(header)
				?.match(/[a-z-_]{2,5}/i)
				?.at(0);
		}
		locale = locale?.split('-').at(0);

		const supportedLngs = this.#i18n?.supportedLngs || i18n.supportedLngs;
		if (locale && !supportedLngs.includes(locale)) {
			locale = null;
		}

		if (!locale) {
			const fallbackLng = this.#i18n?.fallbackLng || i18n.fallbackLng;
			locale = Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng;
		}
		return locale || 'en';
	}
}
