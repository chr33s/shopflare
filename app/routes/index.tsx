import { redirect } from "react-router";

import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	if (url.searchParams.has("shop")) {
		return redirect(`/app?${url.searchParams.toString()}`);
	}

	const data = {};
	return { data }
}

export default function Index() {
  return <h1>ShopFlare</h1>;
}

export async function action(_: Route.ActionArgs) {
	const data = {};
	return { data }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ShopFlare" },
    { name: "description", content: "..." },
  ];
}