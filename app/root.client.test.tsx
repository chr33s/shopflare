import { createRoot } from "react-dom/client";
import { test } from "vitest";

import Root from "./root";

test("component", () => {
	const app = window.document.createElement("div");
	const root = createRoot(app);
	root.render(<Root />);
	root.unmount();
});
