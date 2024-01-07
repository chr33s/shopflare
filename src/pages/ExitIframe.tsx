import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Loading } from "@shopify/app-bridge-react";
import * as React from "react";
import * as ReactRouter from "react-router-dom";

export default function ExitIframe() {
	const app = useAppBridge();
	const { search } = ReactRouter.useLocation();

	React.useEffect(() => {
		if (!!app && !!search) {
			const params = new URLSearchParams(search);
			const redirectUri = params.get("redirectUri") ?? "";
			const url = new URL(decodeURIComponent(redirectUri));

			if (url.hostname === location.hostname) {
				const redirect = Redirect.create(app);
				redirect.dispatch(
					Redirect.Action.REMOTE,
					decodeURIComponent(redirectUri),
				);
			}
		}
	}, [app, search]);

	return <Loading />;
}
