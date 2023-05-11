import * as React from "react";
import * as ReactQuery from "react-query";

import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export const useAppQuery = ({
	url,
	fetchInit = {},
	reactQueryOptions,
}: any) => {
	const authenticatedFetch = useAuthenticatedFetch();
	const fetch = React.useMemo(() => {
		return async () => {
			const response = await authenticatedFetch(url, fetchInit);
			return response.json();
		};
	}, [url, JSON.stringify(fetchInit)]);

	return ReactQuery.useQuery(url, fetch, {
		...reactQueryOptions,
		refetchOnWindowFocus: false,
	});
};
