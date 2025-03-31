import resources from "virtual:i18next-loader";
import type { InitOptions, LanguageDetectorModule, Services } from "i18next";

const i18n = {
	debug: false,
	defaultNS: "app",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
	},
	ns: ["app", "polaris", "proxy"],
	resources,
	supportedLngs: ["en"],
} satisfies InitOptions;

export default i18n;

type DetectorOptions = {
	headers: Headers;
	searchParams: URLSearchParams;
};

export class LanguageDetector implements LanguageDetectorModule {
	public type = "languageDetector" as const;
	static type = "languageDetector" as const;

	#options: DetectorOptions | undefined;

	constructor(
		services: Services,
		detectorOptions: DetectorOptions,
		initOptions: InitOptions,
	) {
		this.init(services, detectorOptions, initOptions);
	}

	public init(
		_services: Services,
		detectorOptions: DetectorOptions,
		_initOptions: InitOptions,
	) {
		this.#options = detectorOptions;
	}

	public detect() {
		let locale: string | null | undefined;
		if (this.#options?.searchParams?.has("locale")) {
			locale = this.#options.searchParams.get("locale"); // shopify admin
		}
		if (!locale && this.#options?.headers?.has("accept-language")) {
			locale = this.#options?.headers
				.get("accept-language")
				?.match(/[a-z-_]{2,5}/i)
				?.at(0); // shopify storefront proxy
		}
		locale = locale?.split("-").at(0);
		if (locale && !i18n.supportedLngs.includes(locale)) {
			locale = null;
		}
		if (!locale) {
			locale = i18n.fallbackLng;
		}
		return locale;
	}
}
