import * as AppBridge from "@shopify/app-bridge-react";
import * as Polaris from "@shopify/polaris";
import * as React from "react";

export default function Page() {
	return (
		<Polaris.Page fullWidth>
			<AppBridge.TitleBar
				title="Page"
				secondaryActions={[
					{
						content: "Uninstall",
						target: "ADMIN_PATH",
						url: "/settings/apps",
					},
				]}
			/>
			<Polaris.Layout>
				<Polaris.Layout.Section fullWidth>
					<Polaris.Box padding="4">
						<Polaris.AlphaCard padding="4">
							<p>content...</p>
						</Polaris.AlphaCard>
					</Polaris.Box>
				</Polaris.Layout.Section>
			</Polaris.Layout>
		</Polaris.Page>
	);
}
