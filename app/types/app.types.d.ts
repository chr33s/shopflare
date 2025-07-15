import type { UIModalAttributes, UITitleBarAttributes, UISaveBarAttributes, UINavMenuAttributes } from "@shopify/app-bridge-types";

declare module "*.json" {
	const content: string;
	export default content;
}

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"ui-modal": UIModalAttributes;
			"ui-title-bar": UITitleBarAttributes;
			"ui-save-bar": UISaveBarAttributes;
			"ui-nav-menu": UINavMenuAttributes;
		}
	}
}