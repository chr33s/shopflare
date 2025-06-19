import {spawn, type SpawnOptionsWithoutStdio} from 'child_process';
import {access, open, readFile, writeFile} from 'node:fs/promises';
import {parseArgs, parseEnv, type ParseArgsOptionsConfig} from 'node:util';

const options: ParseArgsOptionsConfig = {
	env: {
		default: 'development',
		short: 'e',
		type: 'string',
	},
};

const args = parseArgs({
	allowPositionals: true,
	options,
});

const encoding = 'utf-8';

let envFile = `.env.${args.values.env}`;
try {
	await access(envFile);
} catch {
	envFile = '.env';
}

type Env = Record<string, string>;
const env = parseEnv(await readFile(envFile, encoding)) as Env;

type Command = keyof typeof commands;
const [command] = args.positionals as [Command];
const commands = {
	deploy,
	help,
	pull,
	release,
	server,
	setup,
	trigger,
	update,
	use,
	version,
};

if (command in commands) {
	await commands[command]();
} else {
	await commands.help();
}

async function deploy() {
	try {
		const cloudflare = await $(
			/* sh */ `npm run deploy:cloudflare --env=${args.values.env}`,
		);
		if (cloudflare.code !== 0) {
			throw new Error(cloudflare.stderr ?? cloudflare.stdout, {
				cause: cloudflare.code,
			});
		}

		const shopify = await $(/* sh */ `npm run deploy:shopify`);
		if (shopify.code !== 0) {
			throw new Error(shopify.stderr ?? shopify.stdout, {cause: shopify.code});
		}
	} catch (error: any) {
		console.error(error.message);
		process.exit(error.cause ?? 1);
	}
}

async function help() {
	console.log('commands: npx shopflare', Object.keys(commands));
}

async function pull() {
	try {
		const porcelain = await $(/* sh */ `git status --porcelain`);
		if (porcelain.stdout !== '') {
			throw new Error('Please commit or stash your changes first', {
				cause: porcelain.code,
			});
		}

		const get = await $(/* sh */ `
			curl \
			--location \
			--silent https://api.github.com/repos/chr33s/shopflare/tarball \
			| tar \
			--directory=. \
			--exclude={.dev.vars,.editorconfig,.env.test,.github/act,.gitignore,extensions,public,LICENSE.md,package-lock.json,README.md,SECURITY.md} \
			--extract \
			--strip-components=1 \
			--gzip
		`);
		if (get.code !== 0) {
			throw new Error(`Error fetching the latest version: ${get.stderr}`, {
				cause: get.code,
			});
		}

		const install = await $(/* sh */ `npm install`);
		if (install.code !== 0) {
			throw new Error(`Error npm installing: ${install.stderr}`, {
				cause: install.code,
			});
		}
	} catch (error: any) {
		console.error(error.message);
		process.exit(error.cause ?? 1);
	}
}

async function release() {
	try {
		const types = ['patch', 'minor', 'major'] as const;
		const type = args.positionals[1] as (typeof types)[number];
		if (!(type in types)) {
			throw new Error(`Invalid type: ${type}: ${JSON.stringify(types)}`);
		}

		await $(/* sh */ `npm run gen`);
		await $(/* sh */ `git stash --all`);
		await $(/* sh */ `npm version ${type}`);
		await $(/* sh */ `git push --follow-tags`);
		await $(/* sh */ `git stash pop`);
	} catch (error: any) {
		console.error(error.message);
		process.exit(error.cause ?? 1);
	}
}

async function server() {
	await $(/* sh */ `npm run dev`, {stdio: 'inherit'});
}

async function setup() {
	const file = '.git/hooks/pre-commit';
	await writeFile(
		file,
		/* sh */ `
			#!/usr/bin/env sh
			set -eu
			npm run check
		`.replace(/^\s+/gm, ''),
		encoding,
	);
	await $(/* sh */ `chmod +x ${file}`);
}

async function trigger() {
	try {
		const command = args.positionals[1];
		switch (command) {
			case 'action': {
				const workflow = args.positionals[2] ?? 'github';
				const cmd = await $(/* sh */ `
						act \
							--action-offline-mode \
							--container-architecture=linux/amd64 \
							--eventpath=.github/act/event.${workflow}.json \
							--remote-name=github \
							--workflows=.github/workflows/${workflow}.yml
				`);
				if (cmd.code !== 0) {
					throw new Error(cmd.stderr ?? cmd.stdout, {cause: cmd.code});
				}
				console.log(cmd.stdout);
				break;
			}

			case 'webhook': {
				const apiVersion = await import('./app/const.ts').then(
					(mod) => mod.API_VERSION,
				);
				const topic = args.positionals[2] ?? 'app/uninstalled';
				const cmd = await $(/* sh */ `
					npx shopify app webhook trigger \
						--address=${env.SHOPIFY_APP_URL}/shopify/webhooks \
						--api-version=${apiVersion} \
						--client-secret=${env.SHOPIFY_API_SECRET_KEY} \
						--delivery-method=http \
						--topic=${topic}
				`);
				if (cmd.code !== 0) {
					throw new Error(cmd.stderr ?? cmd.stdout, {cause: cmd.code});
				}
				console.log(cmd.stdout);
				break;
			}

			default: {
				console.log(`Unknown command: ${command}`);
			}
		}
	} catch (error: any) {
		console.error(error.message);
		process.exit(error.cause ?? 1);
	}
}

async function update() {
	try {
		const updates = await $(/* sh */ `npm outdated --json`);
		if (updates.code !== 1) {
			throw new Error(`Error running npm outdated: ${updates.stderr}`, {
				cause: updates.code,
			});
		}
		const json = JSON.parse(updates.stdout);
		if (Object.keys(json).length === 0) {
			console.log('No packages to upgrade');
			return;
		}

		const file = './package.json';

		// @ts-expect-error: workaround for ESM import
		const pkg = await import(file, {with: {type: 'json'}});

		const dependencies = [
			'dependencies',
			'devDependencies',
			'optionalDependencies',
		] as const;
		for (const [name, info] of Object.entries<{latest: string}>(json)) {
			for (const dependency of dependencies) {
				if (name in pkg.default[dependency]) {
					pkg.default[dependency][name] = info.latest;
				}
			}
		}

		await writeFile(file, JSON.stringify(pkg.default, null, 2), encoding);

		await $(/* sh */ `npx prettier --write ${file}`);

		console.log('npm updated:', Object.keys(json));
	} catch (error: any) {
		console.error(error.message);
		process.exit(error.cause ?? 1);
	}
}

async function use() {
	console.log(`Using environment: ${args.values.env}\n`);

	const buffer: Buffer[] = [];
	let prefix = '';

	const file = './shopify.app.toml';
	const handle = await open(file, 'rs+');
	for await (const line of handle.readLines({encoding})) {
		buffer.push(Buffer.from(`${line}\n`, encoding));

		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) continue;
		if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
			prefix = trimmedLine.replace(/\[+|\]+/g, '').toUpperCase() ?? '';
			continue;
		}

		const lineParts = trimmedLine
			.match(/(\w+)\s*=\s*"?(\[?[^\s\]"]+\]?)"?/i)
			?.slice(1, 3);
		if (lineParts?.length !== 2) continue;

		let key = ['SHOPIFY_FLAG', prefix, lineParts[0].toUpperCase()]
			.filter(Boolean)
			.join('_');
		if (key === 'SHOPIFY_FLAG_APPLICATION_URL' && !env[key])
			key = 'SHOPIFY_APP_URL';

		const value = lineParts[1];

		if (key in env) {
			if (value === env[key]) continue;

			const replaced = buffer
				.at(-1)!
				.toString(encoding)
				.replace(/(?<==\s*?"?)[^"\s\n]+/i, env[key]);
			buffer[buffer.length - 1] = Buffer.from(replaced);
		}
	}
	await handle.close();

	// git update-index --assume-unchanged ${file}
	await writeFile(file, Buffer.concat(buffer), encoding);
	// git update-index --no-assume-unchanged ${file}
}

async function version() {
	// @ts-expect-error: workaround
	const pkg = await import('./package.json', {with: {type: 'json'}});
	console.log('version:', pkg.default.version);
}

async function $(cmd: string, options?: $Options): Promise<$> {
	return new Promise((resolve, reject) => {
		const command = spawn(cmd, {
			shell: true,
			...options,
			// eslint-disable-next-line no-process-env
			env: {...process.env, ...env, ...options?.env},
		});
		command.on('close', (code) =>
			resolve({
				code: code ?? 1,
				stdout: Buffer.concat(stdout).toString(),
				stderr: Buffer.concat(stderr).toString(),
			}),
		);
		command.on('error', (error) => reject(error));

		const stdout: Buffer[] = [];
		command.stdout?.on('data', (chunk) => stdout.push(chunk));

		const stderr: Buffer[] = [];
		command.stderr?.on('data', (chunk) => stderr.push(chunk));
	});
}

interface $ {
	code: number;
	stdout: string;
	stderr: string;
}

interface $Options extends Omit<SpawnOptionsWithoutStdio, 'stdio'> {
	stdio?: 'inherit' | SpawnOptionsWithoutStdio['stdio'];
}
