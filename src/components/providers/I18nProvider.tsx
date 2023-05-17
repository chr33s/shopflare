import { I18nContext, I18nManager } from "@shopify/react-i18n";
import * as React from "react";

import type { Component as Props } from "@/types";

const locale = "en";
const i18nManager = new I18nManager({
	locale,
	onError(error) {
		console.error(error);
	},
});

export function I18nProvider({ children }: Props) {
	return (
		<I18nContext.Provider value={i18nManager}>{children}</I18nContext.Provider>
	);
}
