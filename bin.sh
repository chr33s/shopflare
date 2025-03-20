#!/usr/bin/env bash

set -eo pipefail
shopt -s nullglob

source .env

function help() {
	echo "npx shopflare [releaseVersion,triggerWebhook,triggerWorkflow,version]"
}

function releaseVersion() {
	version=$(node -p -e "require('./package.json').version")
	release="releases/${version}"
	git tag ${release} -m ""
	git push github tag ${release}
}

function triggerWebhook() {
	topic=${1:-'app/uninstalled'}
	npx shopify app webhook trigger \
		--address=http://localhost:8080/shopify/webhooks \
		--api-version=2025-01 \
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

function version() {
	echo ${npm_package_version}
}

${@:-help}