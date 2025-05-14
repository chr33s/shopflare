import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { type Config, defineConfig } from "drizzle-kit";

let config: Config = {
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
	dialect: "sqlite",
	driver: "d1-http",
	out: "./db/migrations/d1",
	schema: "./db/schema/d1",
};

if (process.env.SHOPIFY_APP_ENV === "development") {
	const dirPath = ".wrangler/state/v3/d1";
	if (!existsSync(dirPath)) {
		const wrangler = JSON.parse(readFileSync("./wrangler.json", "utf-8"));
		const dbName = wrangler.d1_databases[0].database_name;
		spawnSync("npx", ["wrangler", "d1", "migrations", "apply", dbName]);
	}
	const filePath = readdirSync(dirPath, {
		encoding: "utf-8",
		recursive: true,
	}).find((file) => file.endsWith(".sqlite"));
	const url = `${dirPath}/${filePath}`;

	config = {
		dbCredentials: { url },
		dialect: "sqlite",
		out: "./db/migrations/d1",
		schema: "./db/schema/d1",
	};
}

export default defineConfig(config);
