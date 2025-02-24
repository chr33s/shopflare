import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import Index from "./index";

test("loads and displays h1", async () => {
	const screen = render(<Index />);
	const heading = screen.getByTestId("h1");
	await expect.element(heading).toHaveTextContent("ShopFlare");
});
