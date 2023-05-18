import * as React from "react";
import * as ReactQuery from "react-query";

import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export type Props = {
	url: string;
	query: string;
	reactQueryOptions?: any;
};

export function useAppQuery({ url, fetchInit = {}, reactQueryOptions }: any) {
	const authenticatedFetch = useAuthenticatedFetch();
	const fetch = React.useCallback(async () => {
		const response = await authenticatedFetch(url, {
			...fetchInit,
			body: fetchInit.body ? JSON.stringify(fetchInit.body) : undefined,
		});
		return response.json();
	}, [authenticatedFetch, fetchInit, url]);

	return ReactQuery.useQuery({
		queryKey: url,
		queryFn: fetch,
		...reactQueryOptions,
		refetchOnWindowFocus: false,
	});
}

export function useAppMutation({
	url,
	fetchInit = {},
	reactQueryOptions,
}: any) {
	const authenticatedFetch = useAuthenticatedFetch();
	const fetch = React.useCallback(
		async (body: any) => {
			const response = await authenticatedFetch(url, {
				...fetchInit,
				body: JSON.stringify({
					...fetchInit.body,
					...body,
				}),
			});
			return response.json();
		},
		[authenticatedFetch, fetchInit, url]
	);

	return ReactQuery.useMutation({
		mutationKey: url,
		mutationFn: fetch,
		...reactQueryOptions,
		refetchOnWindowFocus: false,
	});
}
