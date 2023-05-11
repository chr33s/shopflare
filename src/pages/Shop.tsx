import * as Polaris from "@shopify/polaris";
import * as React from "react";

import { notFoundImage } from "@/assets";

export default function Shop() {
	const [shop, setShop] = React.useState("");

	const onSubmit = React.useCallback(
		(el: React.FormEvent<HTMLFormElement>) => {
			el.preventDefault();

			const params = new URLSearchParams({ shop: `${shop}.myshopify.com` });
			const url = `/api/auth?${params.toString()}`;
			window.location.href = url;
		},
		[shop]
	);

	return (
		<Polaris.Page>
			<Polaris.LegacyCard>
				<Polaris.EmptyState heading="Shop not found" image={notFoundImage}>
					<div style={{ height: "20px" }} />

					<Polaris.Form onSubmit={onSubmit}>
						<Polaris.FormLayout>
							<Polaris.TextField
								autoComplete="off"
								autoFocus={true}
								label="Shop domain"
								labelHidden={true}
								onChange={(v) => setShop(v)}
								pattern="[0-9a-z\-]+"
								placeholder="shop"
								suffix=".myshopify.com"
								value={shop}
							/>
							<Polaris.Button fullWidth primary submit>
								Continue
							</Polaris.Button>
						</Polaris.FormLayout>
					</Polaris.Form>
				</Polaris.EmptyState>
			</Polaris.LegacyCard>
		</Polaris.Page>
	);
}
