#!/usr/bin/env bash

set -eo pipefail
shopt -s nullglob

source .env

function addGitHook() {
	printf '%s\n' \
		"#!/usr/bin/env sh" \
		"set -eu" \
		"" \
		"npx @biomejs/biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched" \
		"npx tsc --noEmit" \
		> .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
}

function help() {
	echo "npx shopflare [addGitHook,triggerWebhook,triggerWorkflow,update,version]"
}

function triggerWebhook() {
	topic=${1:-'app/uninstalled'}
	npx shopify app webhook trigger \
		--address=http://localhost:8080/shopify/webhooks \
		--api-version=2025-07 \
		--client-secret=${SHOPIFY_API_SECRET_KEY} \
		--delivery-method=http \
		--topic=${topic}
}

function triggerWorkflow() {
	workflow=${1:-github}
	act \
		--action-offline-mode \
		--container-architecture=linux/amd64 \
		--eventpath=.github/act/event.${workflow}.json \
		--remote-name=github \
		--workflows=.github/workflows/${workflow}.yml
}

function update() {
	if [[ $(git status --porcelain) ]]; then
		echo "ERROR: Please commit or stash your changes first"
		exit 1
	fi

	curl \
		--location \
		--silent https://api.github.com/repos/chr33s/shopflare/tarball \
		| tar \
		--directory=. \
		--exclude={.dev.vars,.github/act,.gitignore,extensions,public,LICENSE.md,package-lock.json,README.md,SECURITY.md} \
		--extract \
		--strip-components=1 \
		--gzip

	npm install
	npm run typegen
}

function version() {
	echo ${npm_package_version}
}

${@:-help}