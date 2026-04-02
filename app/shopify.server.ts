import "@shopify/shopify-api/adapters/cf-worker";
import { type ApiVersion, Session, shopifyApi } from "@shopify/shopify-api";
import { AppDistribution, LogSeverity, shopifyApp } from "@shopify/shopify-app-react-router/server";
import { KVSessionStorage } from "@shopify/shopify-app-session-storage-kv";
import { env } from "cloudflare:workers";
import { API_VERSION } from "./const";

const apiVersion = API_VERSION as ApiVersion;

const api: ReturnType<typeof shopifyApi> = shopifyApi({
	apiKey: env.SHOPIFY_API_KEY,
	apiSecretKey: env.SHOPIFY_API_SECRET,
	apiVersion,
	hostName: new URL(env.SHOPIFY_APP_URL).host,
	isEmbeddedApp: true,
});

export const shopify: ReturnType<typeof shopifyApp> = shopifyApp({
	apiKey: env.SHOPIFY_API_KEY,
	apiSecretKey: env.SHOPIFY_API_SECRET,
	appUrl: env.SHOPIFY_APP_URL,
	apiVersion,
	authPathPrefix: "/auth",
	distribution: AppDistribution.AppStore,
	future: {
		expiringOfflineAccessTokens: true,
		unstable_managedPricingSupport: true,
	},
	logger: { level: LogSeverity.Debug },
	sessionStorage: new KVSessionStorage(env.SESSION_KV),
});

export { Session };
export const utils: typeof api.utils = api.utils;
