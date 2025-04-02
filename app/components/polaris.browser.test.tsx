import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import {
	AppProvider,
	Checkbox,
	ColorPicker,
	DatePicker,
	RadioButton,
	RangeSlider,
	Select,
	TextField,
} from "./polaris";

test("Checkbox", async () => {
	const screen = render(<Checkbox label="Test" name="test" />);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("id")).toBe("test");
	expect(input?.getAttribute("name")).toBe("test");
});

test("ColorPicker", async () => {
	const screen = render(<ColorPicker name="test" />);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("name")).toBe("test");
});

test("DatePicker", async () => {
	const screen = render(
		<AppProvider i18n={{}}>
			<DatePicker name="test" month={4} year={2025} />,
		</AppProvider>,
	);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("name")).toBe("test");
});

test("RadioButton", async () => {
	const screen = render(
		<AppProvider i18n={{}}>
			<RadioButton label="Test" name="test" />
		</AppProvider>,
	);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("name")).toBe("test");
});

test("RangeSlider", async () => {
	const screen = render(
		<AppProvider i18n={{}}>
			<RangeSlider label="Test" name="test" />
		</AppProvider>,
	);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("name")).toBe("test");
});

test("Select", async () => {
	const screen = render(
		<AppProvider i18n={{}}>
			<Select label="Test" name="test" />
		</AppProvider>,
	);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("select");
	expect(input?.getAttribute("name")).toBe("test");
});

test("TextField", async () => {
	const screen = render(
		<AppProvider i18n={{}}>
			<TextField autoComplete="off" label="Test" name="test" />
		</AppProvider>,
	);
	const fragment = screen.asFragment();
	const input = fragment.querySelector("input");
	expect(input?.getAttribute("id")).toBe("test");
	expect(input?.getAttribute("name")).toBe("test");
});
