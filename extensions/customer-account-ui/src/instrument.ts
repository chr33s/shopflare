import * as Sentry from "@sentry/react";

Sentry.init({
	defaultIntegrations: false,
	// eslint-disable-next-line no-process-env
	dsn: process.env.SENTRY_DSN,
	// eslint-disable-next-line no-process-env
	environment: process.env.ENVIRONMENT,
	// eslint-disable-next-line no-process-env
	release: process.env.npm_package_version,
});

self.addEventListener("unhandledrejection", (error) => {
	Sentry.captureException(new Error(error.reason.stack));
});

self.addEventListener("error", (error) => {
	Sentry.captureException(new Error(error.error));
});
