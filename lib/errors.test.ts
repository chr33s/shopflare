import { describe, expect, test } from "vitest";

import { AppError } from "./errors";

describe("lib/errors", () => {
	test("AppError", () => {
		const message = "Error message";
		const code = 500;
		const error = new AppError(message, code);

		expect(error.code).toBe(code);
		expect(error.message).toBe(message);
		expect(error.name).toBe("AppError");
	});
});
