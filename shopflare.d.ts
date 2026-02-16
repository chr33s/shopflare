import type * as AppBridge from "@shopify/app-bridge-types";
import "react-router";

declare module "cloudflare:test" {
	interface ProvidedEnv extends Env {}
}

declare module "react" {
	export namespace JSX {
		export interface IntrinsicElements {
			"ui-modal": AppBridge.UIModalAttributes;
			"ui-title-bar": AppBridge.UITitleBarAttributes;
			"ui-save-bar": AppBridge.UISaveBarAttributes;
			"ui-nav-menu": AppBridge.UINavMenuAttributes;
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
		readonly SHOPIFY_APP_LOG_LEVEL: "error" | "warn" | "info" | "debug";
		readonly SHOPIFY_APP_URL: string;
	}

	export interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
