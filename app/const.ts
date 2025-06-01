export const API_KEY = import.meta.env.SHOPIFY_API_KEY;
export const API_VERSION = '2025-04';
export const APP_BRIDGE_URL =
	'https://cdn.shopify.com/shopifycloud/app-bridge.js';
export const APP_BRIDGE_UI_URL =
	'https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js';
export const APP_HANDLE = import.meta.env.SHOPIFY_APP_HANDLE;
export const APP_LINKS = [
	{href: 'https://cdn.shopify.com', rel: 'preconnect'},
	{as: 'script', href: APP_BRIDGE_URL, rel: 'preload'},
	{as: 'script', href: APP_BRIDGE_UI_URL, rel: 'preload'},
	{
		href: 'https://cdn.shopify.com/static/fonts/inter/v4/styles.css',
		precedence: 'default',
		rel: 'stylesheet',
	},
];
export const APP_LOG_LEVEL = import.meta.env.SHOPIFY_APP_LOG_LEVEL;
