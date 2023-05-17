import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import { useI18n } from "@shopify/react-i18n";
import "@shopify/polaris/build/esm/styles.css";
import * as React from "react";

import type { Component } from "@/types";

type Props = Component & {
	url: string;
	external: boolean;
};

function AppBridgeLink({ url, children, external, ...rest }: Props) {
	const navigate = AppBridge.useNavigate();
	const handleClick = React.useCallback(() => {
		navigate(url);
	}, [url]);

	const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/;

	if (external || IS_EXTERNAL_LINK_REGEX.test(url)) {
		return (
			<a target="_blank" rel="noopener noreferrer" href={url} {...rest}>
				{children}
			</a>
		);
	}

	return (
		<a onClick={handleClick} {...rest}>
			{children}
		</a>
	);
}

export function PolarisProvider({ children }: Component) {
	const [i18n] = useI18n({
		id: "Polaris",
		fallback: translations,
		async translations(locale) {
			return await import(
				/* @vite-ignore */ `@shopify/polaris/locales/${locale}.json`
			).then((dictionary) => dictionary && dictionary.default);
		},
	});

	return (
		<Polaris.AppProvider
			i18n={i18n.translations}
			linkComponent={AppBridgeLink as any}
		>
			<Polaris.Frame>{children}</Polaris.Frame>
		</Polaris.AppProvider>
	);
}
