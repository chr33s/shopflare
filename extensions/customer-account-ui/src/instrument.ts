import * as Sentry from "@sentry/react";

Sentry.init({ dsn: process.env.SENTRY_DSN });

self.addEventListener("unhandledrejection", (error) => {
	Sentry.captureException(new Error(error.reason.stack));
});

self.addEventListener("error", (error) => {
	Sentry.captureException(new Error(error.error));
});
