import * as Polaris from "@shopify/polaris";
import * as React from "react";

import { notFoundImage } from "@/assets";

export default function NotFound() {
	return (
		<Polaris.Page>
			<Polaris.LegacyCard>
				<Polaris.EmptyState
					heading="There is no page at this address"
					image={notFoundImage}
				>
					<p>
						Check the URL and try again, or use the search bar to find what you
						need.
					</p>
				</Polaris.EmptyState>
			</Polaris.LegacyCard>
		</Polaris.Page>
	);
}
