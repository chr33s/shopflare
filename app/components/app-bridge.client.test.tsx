import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";

import { useAppBridge } from "./app-bridge";

test("useAppBridge", async () => {
	const origin = "https://example.com";
	// biome-ignore lint/suspicious/noExplicitAny: tmp
	(window as any).shopify = { origin };
	const app = window.document.createElement("div");
	const root = createRoot(app);
	const Component = () => {
		const appBridge = useAppBridge();
		return <>{appBridge.origin}</>;
	};
	// biome-ignore lint/suspicious/noExplicitAny: tmp
	(global as any).IS_REACT_ACT_ENVIRONMENT = true;
	await act(async () => root.render(<Component />));
	expect(app.textContent).toBe(origin);
	await act(async () => root.unmount());
});
