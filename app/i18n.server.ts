import { createInstance } from "i18next";

import i18n, { Backend } from "~/i18n";

export async function getFixedT(
	request: Request,
	namespaces: string | string[] = i18n.defaultNS,
) {
	const instance = createInstance();
	instance.use(Backend);
	await instance.init();

	const locale = getLocale(request);
	await instance.changeLanguage(locale);

	await instance.loadNamespaces(namespaces);

	return instance.getFixedT(locale, namespaces);
}

export function getLocale(request: Request) {
	const url = new URL(request.url);
	let locale = url.searchParams.get("locale"); // shopify admin
	if (!locale) {
		locale = request.headers.get("accept-language")?.split(",").at(0) ?? null; // shopify storefront proxy
	}
	if (!locale) {
		locale = i18n.fallbackLng;
	}
	return locale;
}
