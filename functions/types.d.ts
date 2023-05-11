import type { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
	SHOPIFY_API_HOST: string;
	SHOPIFY_API_KEY: string;
	SHOPIFY_API_SECRET_KEY: string;
	SHOPIFY_API_SCOPES: string;
	SHOPIFY_SESSIONS_KV: KVNamespace;
}
