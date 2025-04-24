import fs from "node:fs";
import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";
import type { IGraphQLProject, IGraphQLProjects } from "graphql-config";

type Config = IGraphQLProject & IGraphQLProjects;

import { API_VERSION } from "./app/const";

function getConfig() {
	const config: Config = {
		projects: {
			default: shopifyApiProject({
				apiType: ApiType.Admin,
				apiVersion: API_VERSION,
				documents: ["./app/**/*.{ts,tsx}"],
				outputDir: "./app/types",
			}),
		},
		schema: `https://shopify.dev/admin-graphql-direct-proxy/${API_VERSION}`,
	};

	let extensions: string[] = [];
	try {
		extensions = fs.readdirSync("./extensions");
	} catch {
		// ignore if no extensions
	}

	for (const entry of extensions) {
		const extensionPath = `./extensions/${entry}`;
		const schema = `${extensionPath}/schema.graphql`;
		if (!fs.existsSync(schema)) {
			continue;
		}
		config.projects[entry] = {
			schema,
			documents: [`${extensionPath}/**/*.graphql`],
		};
	}

	return config;
}

export default getConfig();
