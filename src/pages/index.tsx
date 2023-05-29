import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import * as React from "react";

import { useI18n } from "@/hooks";

export default function Page() {
	const [i18n] = useI18n();

	return (
		<Polaris.Page fullWidth>
			<AppBridge.TitleBar
				title={i18n.translate("app.page.title")}
				secondaryActions={[
					{
						content: i18n.translate("app.uninstall"),
						target: "ADMIN_PATH",
						url: "/settings/apps",
					},
				]}
			/>
			<Polaris.Layout>
				<Polaris.Layout.Section fullWidth>
					<Polaris.Box padding="4">
						<Polaris.Card padding="4">
							<p>{i18n.translate("app.page.content")}</p>
						</Polaris.Card>
					</Polaris.Box>
				</Polaris.Layout.Section>
			</Polaris.Layout>
		</Polaris.Page>
	);
}
