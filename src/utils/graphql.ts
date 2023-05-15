import { type Props } from "@/hooks/useAppQuery";

export function graphql({ url, query, reactQueryOptions }: Props) {
	return {
		url,
		fetchInit: {
			headers: { "Content-Type": "application/json" },
			body: { query },
			method: "POST",
		},
		reactQueryOptions: {
			queryKey: query,
			...reactQueryOptions,
			retry: 0,
		},
	};
}
