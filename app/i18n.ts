import type {
	BackendModule,
	InitOptions,
	LanguageDetectorModule,
	Services,
} from "i18next";

const i18n = {
	debug: false,
	backend: {
		url: "/i18n/{{lng}}.{{ns}}.json",
		base: undefined,
	},
	defaultNS: "app",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
	},
	ns: ["app", "polaris", "proxy"],
	supportedLngs: ["en"],
} satisfies InitOptions;

export default i18n;

type BackendOptions = {
	base: string;
	url: string;
};

export class Backend implements BackendModule {
	public type = "backend" as const;
	static type = "backend" as const;

	#options: BackendOptions | undefined;

	constructor(
		services: Services,
		backendOptions: BackendOptions,
		initOptions: InitOptions,
	) {
		this.init(services, backendOptions, initOptions);
	}

	init(
		_services: Services,
		backendOptions: BackendOptions,
		_initOptions: InitOptions,
	) {
		this.#options = backendOptions;
	}

	async read(language: string, namespace: string) {
		const uri = (this.#options?.url ?? i18n.backend.url)
			.replace("{{lng}}", language)
			.replace("{{ns}}", namespace);
		const base = this.#options?.base ?? i18n.backend.base;
		const url = new URL(uri, base);
		return fetch(url).then((res) => res.json());
	}
}

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
		let locale;
		if (this.#options?.searchParams?.has("locale")) {
			locale = this.#options.searchParams.get("locale"); // shopify admin
		}
		if (!locale && this.#options?.headers?.has("accept-language")) {
			locale = this.#options?.headers
				.get("accept-language")
				?.match(/[a-z-_]{2,5}/i)
				?.at(0); // shopify storefront proxy
		}
		if (!locale) {
			locale = i18n.fallbackLng;
		}
		return locale.split("-").at(0);
	}
}
