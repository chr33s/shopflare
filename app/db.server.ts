import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";

export function createDatabase(context: AppLoadContext) {
	const db = drizzle(context.cloudflare.env.DB);
	return db;
}
