import {
  type AnchorHTMLAttributes,
  createContext,
  type ComponentChildren,
  type DetailedHTMLProps,
} from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import * as ReactRouter from "react-router";

export type FormProps = ReactRouter.FormProps;

export function Form(props: FormProps) {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Proxy.Form must be used within an Proxy.Provider component");
  }

  const { children, action, ...otherProps } = props;

  return (
    <ReactRouter.Form action={context.formatUrl(action, false)} {...otherProps}>
      {children}
    </ReactRouter.Form>
  );
}

type FormatUrlFunction = (url: string | undefined, addOrigin?: boolean) => string | undefined;

interface ContextProps {
  appUrl: string;
  formatUrl: FormatUrlFunction;
  requestUrl?: URL;
}

export const Context = createContext<ContextProps | null>(null);

export interface LinkProps extends Omit<
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
  "href" | "role"
> {
  href: string;
}

export function Link(props: LinkProps) {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Proxy.Link must be used within an Proxy.Provider component");
  }

  const { children, href, ...otherProps } = props;

  return (
    <a href={context.formatUrl(href)!} {...otherProps}>
      {children}
    </a>
  );
}

export interface ProviderProps {
  appUrl: string;
  children?: ComponentChildren;
}

export function Provider(props: ProviderProps) {
  const { children, appUrl } = props;
  const [requestUrl, setRequestUrl] = useState<URL | undefined>();

  useEffect(() => setRequestUrl(new URL(window.location.href)), []);

  const value = useMemo(
    () => ({
      appUrl,
      formatUrl: formatProxyUrl(requestUrl),
      requestUrl,
    }),
    [appUrl, requestUrl],
  );

  return (
    <Context value={value}>
      <base href={appUrl} />

      {children}
    </Context>
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
