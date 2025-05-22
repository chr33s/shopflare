import type { FunctionComponent, SVGAttributes } from "react";

declare module "*.css" {
	const content: string;
	export default content;
}

declare module "*.json" {
	const content: string;
	export default content;
}

declare module "*.svg" {
	const content: FunctionComponent<SVGAttributes<SVGElement>>;
	export default content;
}

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"ui-modal": React.JSX.IntrinsicElements.UIModalAttributes;
			"ui-title-bar": React.JSX.IntrinsicElements.UITitleBarAttributes;
			"ui-save-bar": React.JSX.IntrinsicElements.UISaveBarAttributes;
			"ui-nav-menu": React.JSX.IntrinsicElements.UINavMenuAttributes;
		}
	}
}