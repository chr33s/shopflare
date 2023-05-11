import * as React from "react";
import * as ReactQuery from "react-query";

import type { Component as Props } from "@/types";

export function QueryProvider({ children }: Props) {
	const client = new ReactQuery.QueryClient({
		queryCache: new ReactQuery.QueryCache(),
		mutationCache: new ReactQuery.MutationCache(),
	});

	return (
		<ReactQuery.QueryClientProvider client={client}>
			{children}
		</ReactQuery.QueryClientProvider>
	);
}
