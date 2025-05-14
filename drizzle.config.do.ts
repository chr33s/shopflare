import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./db/migrations/do",
	schema: "./db/schema/do.ts",
	dialect: "sqlite",
	driver: "durable-sqlite",
});
