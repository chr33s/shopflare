import {
  AppProvider,
  Button,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";
import { Form, redirect, useActionData, useLoaderData } from "react-router";

import type { Route } from "./+types/shopify.auth";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	return action({ context, request } as Route.ActionArgs);
}

export default function AuthLogin() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { errors } = actionData ?? loaderData ?? {};
  const [shop, setShop] = useState("");

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <AppProvider i18n={{}}>
        <Page narrowWidth>
          <Form method="post">
            <FormLayout>
              <Text as="h2" variant="headingMd">
                Log in
              </Text>
              <TextField
                autoComplete="on"
                error={errors?.shop}
                label="Shop domain"
                name="shop"
                onChange={setShop}
                pattern="^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$"
                placeholder="example.myshopify.com"
                type="text"
                value={shop}
              />
              <Button submit variant="primary">
                Log in
              </Button>
            </FormLayout>
          </Form>
        </Page>
      </AppProvider>
    </div>
  );
}

export async function action({ context, request }: Route.ActionArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);
	const shopParam = url.searchParams.get('shop');
	if (request.method === 'GET' && !shopParam) {
		return { errors: { shop: undefined } };
	}

	const shop: string | null = shopParam || ((await request.formData()).get('shop') as string);
	if (!shop) {
		return { shop: 'MISSING_SHOP' };
	}

	const shopWithoutProtocol = shop
		.replace(/^https?:\/\//, '')
		.replace(/\/$/, '');
	const shopWithDomain =
		shop?.indexOf('.') === -1
			? `${shopWithoutProtocol}.myshopify.com`
			: shopWithoutProtocol;
	const sanitizedShop = shopify.api.utils.sanitizeShop(shopWithDomain);
	if (!sanitizedShop) {
		return { shop: 'INVALID_SHOP' };
	}

	const appUrl = `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}`;
	const authPath = `${appUrl}/shopify/auth?shop=${sanitizedShop}`;
	const adminPath = shopify.api.utils.legacyUrlToShopAdminUrl(sanitizedShop);
	const installPath = `https://${adminPath}/oauth/install?client_id=${shopify.api.config.apiKey}`;

	const shouldInstall = shopify.api.config.isEmbeddedApp && shopify.api.config.future.unstable_newEmbeddedAuthStrategy;
	const redirectUrl = shouldInstall ? installPath : authPath;
	throw redirect(redirectUrl);
}
