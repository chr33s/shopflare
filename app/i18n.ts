import type { BackendModule, InitOptions, Services } from "i18next";

const i18n = {
	debug: false,
	backend: {
		loadPath: "/i18n/{{lng}}.{{ns}}.json",
	},
	defaultNS: ["app"],
	fallbackLng: "en",
	interpolation: {
		escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
	},
	ns: ["app", "polaris", "proxy"],
	supportedLngs: ["en"],
} satisfies InitOptions;

export default i18n;

export class Backend implements BackendModule {
	public type = "backend" as const;
	static type = "backend" as const;

	private loadPath = i18n.backend.loadPath;

	init(
		_services: Services,
		backendOptions: { loadPath?: string } | undefined,
		_i18nextOptions: InitOptions,
	) {
		this.loadPath = backendOptions?.loadPath ?? this.loadPath;
	}

	async read(language: string, namespace: string) {
		const path = this.loadPath
			.replace("{{lng}}", language)
			.replace("{{ns}}", namespace);
		return fetch(path).then((res) => res.json());
	}
}
