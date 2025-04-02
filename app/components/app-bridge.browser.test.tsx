import { expect, test } from "vitest";
import { render, renderHook } from "vitest-browser-react";

import { Modal, NavMenu, SaveBar, TitleBar, useAppBridge } from "./app-bridge";

test("Modal", async () => {
	window.customElements.define(
		"ui-modal",
		class UiModalElement extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open" });
			}

			show() {}
			hide() {}
		},
	);

	const screen = render(<Modal id="test" />);
	const fragment = screen.asFragment();
	const el = fragment.getElementById("test")!;
	await expect.element(el).toBeDefined();
});

test("NavMenu", async () => {
	const screen = render(
		<NavMenu>
			<a data-testid="test" href="/" rel="home">
				Link
			</a>
		</NavMenu>,
	);
	const a = screen.getByText("Link");
	await expect.element(a).toBeDefined();
});

test("SaveBar", async () => {
	window.customElements.define(
		"ui-save-bar",
		class UiSaveBarElement extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open" });
			}

			show() {}
			hide() {}
		},
	);

	const screen = render(<SaveBar id="test" />);
	const fragment = screen.asFragment();
	const el = fragment.getElementById("test")!;
	await expect.element(el).toBeDefined();
});

test("TitleBar", async () => {
	const screen = render(<TitleBar title="Test" />);
	const el = screen.getByTitle("Test");
	await expect.element(el).toBeDefined();
});

test("useAppBridge", async () => {
	const origin = "https://example.com";
	// biome-ignore lint/suspicious/noExplicitAny: tmp
	(window as any).shopify = { origin };
	const { result } = renderHook(() => useAppBridge());
	expect(result.current.origin).toBe(origin);
});
