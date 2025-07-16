import {env} from 'cloudflare:test';
import {test} from 'vitest';

export async function getHmacFromSearchParams(searchParams: object) {
	const params = Object.entries(searchParams)
		.filter(([key]) => key !== 'signature')
		.map(
			([key, value]) =>
				`${key}=${Array.isArray(value) ? value.join(',') : value}`,
		)
		.sort((a, b) => a.localeCompare(b))
		.join('');

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(env.SHOPIFY_API_SECRET_KEY),
		{
			name: 'HMAC',
			hash: 'SHA-256',
		},
		true,
		['sign'],
	);
	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(params),
	);
	// hex
	const hmac = [...new Uint8Array(signature)].reduce(
		(a, b) => a + b.toString(16).padStart(2, '0'),
		'',
	);
	return hmac;
}

test.todo('getHmacFromSearchParams');

export async function getHmacFromBody(body: string) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(env.SHOPIFY_API_SECRET_KEY),
		{
			name: 'HMAC',
			hash: 'SHA-256',
		},
		true,
		['sign'],
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
	// base64
	const hmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
	return hmac;
}

test.todo('getHmacFromBody');
