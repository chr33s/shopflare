import type { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
	DEBUG?: boolean;
	SHOPIFY_API_HOST: string;
	SHOPIFY_API_KEY: string;
	SHOPIFY_API_SECRET_KEY: string;
	SHOPIFY_API_SCOPES: string;
	SHOPFLARE_KV: KVNamespace;
}
