import React from "react";
import renderer from "react-test-renderer";
import { describe, expect, test } from "vitest";

import App from "./App";

describe("App", function () {
	test("renders", () => {
		const component = renderer.create(<App />);
		const instance = component.root;
		expect(instance).toBeDefined();
	});
});
