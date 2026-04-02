import type * as AppBridge from "@shopify/app-bridge-types";
import "react-router";

declare module "cloudflare:workers" {
	interface ProvidedEnv extends Env {}
}

declare module "react" {
	export namespace JSX {
		export interface IntrinsicElements {
			"s-app-nav": AppBridge.SAppNavAttributes;
			"s-link": globalThis.JSX.IntrinsicElements["s-link"] & { rel?: string };
			"s-button": globalThis.JSX.IntrinsicElements["s-button"] & {
				suppressHydrationWarning?: boolean;
			};
			"ui-save-bar": AppBridge.UISaveBarAttributes;
		}
	}
}

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
	interface ViteTypeOptions {}

	interface ImportMetaEnv {
		readonly SHOPIFY_API_KEY: string;
		readonly SHOPIFY_APP_HANDLE: string;
		readonly SHOPIFY_APP_URL: string;
	}

	export interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};
