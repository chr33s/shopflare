import type { Route } from "./+types/app.index";

export async function loader(_: Route.LoaderArgs) {
	const data = {};
	return { data };
}

export default function ProxyIndex() {
	return <h1>Proxy</h1>;
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data };
}
