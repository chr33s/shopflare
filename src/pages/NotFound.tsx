import * as Polaris from "@shopify/polaris";
import * as React from "react";

import { notFoundImage } from "@/assets";
import { useI18n } from "@/hooks";

export default function NotFound() {
	const [i18n] = useI18n();

	return (
		<Polaris.Page>
			<Polaris.Card>
				<Polaris.EmptyState
					heading={i18n.translate("app.page.notFound.heading")}
					image={notFoundImage}
				>
					<p>{i18n.translate("app.page.notFound.content")}</p>
				</Polaris.EmptyState>
			</Polaris.Card>
		</Polaris.Page>
	);
}
