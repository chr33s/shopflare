import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export function useAuthenticatedFetch() {
	const app = useAppBridge();
	const fetchFunction = authenticatedFetch(app);

	return async (uri: string, options: any) => {
		const response = await fetchFunction(uri, options);
		checkHeadersForReauthorization(response.headers, app);
		return response;
	};
}

function checkHeadersForReauthorization(headers: Headers, app: any) {
	if (headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
		const authUrlHeader =
			headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ||
			`/api/auth`;

		const redirect = Redirect.create(app);
		redirect.dispatch(
			Redirect.Action.REMOTE,
			authUrlHeader.startsWith("/")
				? `https://${window.location.host}${authUrlHeader}`
				: authUrlHeader
		);
	}
}
