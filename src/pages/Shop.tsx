import * as Polaris from "@shopify/polaris";
import * as React from "react";

import { notFoundImage } from "@/assets";
import { useI18n } from "@/hooks";

export default function Shop() {
	const [value, setValue] = React.useState("");

	const onSubmit = React.useCallback(
		(el: React.FormEvent<HTMLFormElement>) => {
			el.preventDefault();

			const shop = `${value}.myshopify.com`;
			const host = btoa(`${shop}/admin`);
			const params = new URLSearchParams({ host, shop });
			const url = `/api/auth?${params.toString()}`;
			window.location.href = url;
		},
		[value],
	);

	const [i18n] = useI18n();

	return (
		<Polaris.Page>
			<Polaris.Card>
				<Polaris.EmptyState
					heading={i18n.translate("app.shop.notFound")}
					image={notFoundImage}
				>
					<div style={{ height: "20px" }} />

					<Polaris.Form onSubmit={onSubmit}>
						<Polaris.FormLayout>
							<Polaris.TextField
								autoComplete="off"
								autoFocus={true}
								label={i18n.translate("app.shop.domain")}
								labelHidden={true}
								onChange={(v) => setValue(v)}
								pattern="[0-9a-z\-]+"
								placeholder="shop"
								suffix=".myshopify.com"
								value={value}
							/>
							<Polaris.Button fullWidth submit variant="primary">
								{i18n.translate("app.shop.button")}
							</Polaris.Button>
						</Polaris.FormLayout>
					</Polaris.Form>
				</Polaris.EmptyState>
			</Polaris.Card>
		</Polaris.Page>
	);
}
