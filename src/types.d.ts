import * as React from "react";

export type Component = {
	children: React.ReactNode;
};

declare global {
	interface Window {
		__SHOPIFY_DEV_HOST: string;
	}
}

declare module "*.json" {
	const content: string;
	export default content;
}

declare module "*.png" {
	const content: string;
	export default content;
}

declare module "*.svg" {
	const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
	export default content;
}
