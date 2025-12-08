import type * as AppBridge from "@shopify/app-bridge-types";
import type * as Preact from "preact";

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}

import "@shopify/app-bridge-types";
import "@shopify/app-bridge-ui-types";
declare module "preact/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends Preact.createElement.JSX.IntrinsicElements {
      "ui-modal": AppBridge.UIModalAttributes;
      "ui-nav-menu": AppBridge.UINavMenuAttributes;
      "ui-save-bar": AppBridge.UISaveBarAttributes;
      "ui-title-bar": AppBridge.UITitleBarAttributes;
    }
  }
}

import "react-router";
declare module "react-router" {
  export interface Future {
    unstable_viteEnvironmentApi: true;
    v8_middleware: true;
  }
  export interface RouterContextProvider {
    cloudflare?: { env: Env; ctx: ExecutionContext };
  }
}

declare module "vite/client" {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ViteTypeOptions {}

  interface ImportMetaEnv {
    readonly SHOPIFY_API_KEY: string;
    readonly SHOPIFY_APP_HANDLE: string;
    readonly SHOPIFY_APP_LOG_LEVEL: "error" | "warn" | "info" | "debug";
    readonly SHOPIFY_APP_URL: string;
  }

  export interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "vitest-browser-preact" {
  import type { Locator } from "@vitest/browser/context";
  import type { JSX } from "preact";

  interface LocatorOptions {
    exact?: boolean;
  }

  interface LocatorByRoleOptions extends LocatorOptions {
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    includeHidden?: boolean;
    level?: number;
    name?: string | RegExp;
    pressed?: boolean;
    selected?: boolean;
  }

  interface RenderResult {
    container: HTMLElement;
    baseElement: HTMLElement;
    locator: Locator;
    debug: (el?: HTMLElement | HTMLElement[] | Locator[], maxLength?: number) => void;
    unmount: () => void;
    rerender: (ui: JSX.Element) => void;
    asFragment: () => DocumentFragment;
    getByRole: (role: string, options?: LocatorByRoleOptions) => Locator;
    getByLabelText: (text: string | RegExp, options?: LocatorOptions) => Locator;
    getByAltText: (text: string | RegExp, options?: LocatorOptions) => Locator;
    getByPlaceholder: (text: string | RegExp, options?: LocatorOptions) => Locator;
    getByText: (text: string | RegExp, options?: LocatorOptions) => Locator;
    getByTitle: (text: string | RegExp, options?: LocatorOptions) => Locator;
    getByTestId: (testId: string | RegExp) => Locator;
  }

  export function render(
    ui: JSX.Element,
    options?: {
      container?: HTMLElement;
      baseElement?: HTMLElement;
      wrapper?: (props: { children: JSX.Element }) => JSX.Element;
    },
  ): RenderResult;

  export function cleanup(): void;
}
