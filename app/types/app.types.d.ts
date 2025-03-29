import type { DocumentNode, FragmentDefinitionNode } from "graphql";
import type { FunctionComponent, SVGAttributes } from "react";

declare module "*.css" {
	const content: string;
	export default content;
}

declare module "*.graphql" {
	const content: DocumentNode | FragmentDefinitionNode;
	export = Record<string, content>;
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
