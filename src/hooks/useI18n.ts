import * as reactI18n from "@shopify/react-i18n";

import en from "@/locales/en.json";

export function useI18n() {
	return reactI18n.useI18n({
		id: "app",
		fallback: en,
		async translations(locale) {
			switch (locale) {
				case "en":
				default:
					return en;
			}
		},
	});
}
