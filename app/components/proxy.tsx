import {
	type AnchorHTMLAttributes,
	createContext,
	type DetailedHTMLProps,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	Form as ReactRouterForm,
	type FormProps as ReactRouterFormProps,
} from "react-router";

export interface FormProps extends ReactRouterFormProps {
	action: string;
}

export function Form(props: FormProps) {
	const context = useContext(Context);

	if (!context) {
		throw new Error(
			"Proxy.Form must be used within an Proxy.Provider component",
		);
	}

	const { children, action, ...otherProps } = props;

	return (
		<ReactRouterForm action={context.formatUrl(action, false)} {...otherProps}>
			{children}
		</ReactRouterForm>
	);
}

type FormatUrlFunction = (
	url: string | undefined,
	addOrigin?: boolean,
) => string | undefined;

interface ContextProps {
	appUrl: string;
	formatUrl: FormatUrlFunction;
	requestUrl?: URL;
}

export const Context = createContext<ContextProps | null>(null);

export interface LinkProps
	extends DetailedHTMLProps<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	> {
	href: string;
}

export function Link(props: LinkProps) {
	const context = useContext(Context);

	if (!context) {
		throw new Error(
			"Proxy.Link must be used within an Proxy.Provider component",
		);
	}

	const { children, href, ...otherProps } = props;

	return (
		<a href={context.formatUrl(href)} {...otherProps}>
			{children}
		</a>
	);
}

export interface ProviderProps {
	appUrl: string;
	children?: ReactNode;
}

export function Provider(props: ProviderProps) {
	const { children, appUrl } = props;
	const [requestUrl, setRequestUrl] = useState<URL | undefined>();

	useEffect(() => setRequestUrl(new URL(window.location.href)), []);

	return (
		<Context.Provider
			value={{
				appUrl,
				requestUrl,
				formatUrl: formatProxyUrl(requestUrl),
			}}
		>
			<base href={appUrl} />

			{children}
		</Context.Provider>
	);
}

function formatProxyUrl(requestUrl: URL | undefined): FormatUrlFunction {
	return (url: string | undefined, addOrigin = true) => {
		if (!url) {
			return url;
		}

		let finalUrl = url;

		if (addOrigin && requestUrl && finalUrl.startsWith("/")) {
			finalUrl = new URL(`${requestUrl.origin}${url}`).href;
		}
		if (!finalUrl.endsWith("/")) {
			finalUrl = `${finalUrl}/`;
		}

		return finalUrl;
	};
}
