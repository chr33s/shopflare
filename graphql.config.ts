import fs from "node:fs";

import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset";
import type { IGraphQLProject, IGraphQLProjects } from "graphql-config";
import { API_KEY, API_VERSION } from "./app/const";

type Config = IGraphQLProject & IGraphQLProjects;

const config: Config = {
	projects: {
		admin: shopifyApiProject({
			apiType: ApiType.Admin,
			apiVersion: API_VERSION,
			documents: ["./app/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./app/graphql/*.gql"],
			outputDir: "./app/types",
		}),
		customer: shopifyApiProject({
			apiKey: API_KEY,
			apiType: ApiType.Customer,
			apiVersion: API_VERSION,
			documents: ["./app/graphql/query.shop.gql"],
			outputDir: "./app/types",
		}),
		storefront: shopifyApiProject({
			apiType: ApiType.Storefront,
			apiVersion: API_VERSION,
			documents: ["./app/graphql/query.shop.gql"],
			outputDir: "./app/types",
		}),
	},
	schema: `https://shopify.dev/admin-graphql-direct-proxy/${API_VERSION}`,
};

try {
	const extensions = fs.readdirSync("./extensions");
	for (const entry of extensions) {
		const extensionPath = `./extensions/${entry}`;
		const schema = `${extensionPath}/schema.graphql`;
		if (!fs.existsSync(schema)) {
			continue;
		}
		config.projects[entry] = {
			documents: [`${extensionPath}/**/*.graphql`],
			schema,
		};
	}
} catch {
	// ignore if no extensions
}

export default config;
