import { env } from "cloudflare:workers";
import { type InitOptions, createInstance } from "i18next";

import i18n, { Backend, LanguageDetector } from "~/i18n";

export async function getFixedT(
	request: Request,
	namespaces: string | string[] = i18n.defaultNS,
	options: Omit<InitOptions, "react"> & { keyPrefix?: string } = {},
) {
	const instance = createInstance();
	instance.use(LanguageDetector);
	instance.use(Backend);
	await instance.init({
		...i18n,
		...options,
		backend: {
			...i18n.backend,
			base: env.SHOPIFY_APP_URL,
		},
		detection: {
			headers: request.headers,
			searchParams: new URL(request.url).searchParams,
		},
	});

	await instance.loadNamespaces(namespaces);

	return instance.getFixedT(instance.language, namespaces);
}
