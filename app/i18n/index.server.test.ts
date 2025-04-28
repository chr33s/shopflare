import type { InitOptions, Services } from "i18next";
import { describe, expect, test } from "vitest";

import { LanguageDetector } from "./index";

describe("detect", () => {
	const services = {} as Services;
	const initOptions = {
		fallbackLng: "zz",
		supportedLngs: ["aa", "bb"],
	} as InitOptions;

	test("searchParams", () => {
		const detectorOptions = {
			headers: new Headers({ "Accept-Language": "aa" }),
			searchParams: new URLSearchParams({ locale: "bb" }),
		};
		const languageDetector = new LanguageDetector(
			services,
			detectorOptions,
			initOptions,
		);

		expect(languageDetector.detect()).toBe("bb");
	});

	test("headers", () => {
		const detectorOptions = {
			headers: new Headers({ "Accept-Language": "aa" }),
			searchParams: new URLSearchParams({}),
		};
		const languageDetector = new LanguageDetector(
			services,
			detectorOptions,
			initOptions,
		);

		expect(languageDetector.detect()).toBe("aa");
	});

	test("fallback", () => {
		const detectorOptions = {
			headers: new Headers({ "Accept-Language": "cc" }),
			searchParams: new URLSearchParams({ locale: "dd" }),
		};
		const languageDetector = new LanguageDetector(
			services,
			detectorOptions,
			initOptions,
		);

		expect(languageDetector.detect()).toBe("zz");
	});
});
