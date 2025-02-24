import type { Route } from "./+types/shopify.web-vitals";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);

	const body = await request.json<Body>();
	shopify.utils.log.debug("shopify.web-vitals", { body });

	await Promise.all([
		body.metrics.map((metric) => {
			return context.cloudflare.env.WEB_VITALS.writeDataPoint({
				blobs: [metric.name, body.appLoadId, body.shopId, body.userId],
				doubles: [metric.value],
				indexes: [metric.id],
			});
		}),
	]);

	return new Response(null, { status: 204 });
}

interface Body {
	appId: string; // Identifier for the app (e.g., "gid://shopify/App/1")
	shopId: string; // Identifier for the shop (e.g., "10").
	userId: string; // Identifier for the user (e.g., "5").
	appLoadId: string; // Unique identifier for the current app load session.
	metrics: Array<{
		id: string; // Unique identifier for the metric.
		name: string; //Name of the metric (e.g., "LCP", "FCP", "CLS").
		value: number; // Value of the metric (can be integer or float).
	}>;
}
