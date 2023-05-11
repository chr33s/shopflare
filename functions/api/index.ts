import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async () => {
	return new Response(JSON.stringify({ status: "ok" }), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
