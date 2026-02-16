import { createRoutesStub } from "react-router";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import Index from "./index";

vi.mock("react-i18next", () => ({
	initReactI18next: {
		init: () => {},
		type: "3rdParty",
	},
	useTranslation: () => ({
		i18n: {
			changeLanguage: () => new Promise(() => {}),
		},
		t: (i18nKey: string) => i18nKey,
	}),
}));

test("loads and displays h1", async () => {
	const Stub = createRoutesStub([
		{
			action() {
				return {};
			},
			Component: Index as any,
			HydrateFallback: () => null,
			loader() {
				return {};
			},
			path: "/",
		},
	]);

	const screen = render(<Stub initialEntries={["/"]} />);
	const label = screen.getByText("login");
	await expect.element(label).toBeVisible();
});
