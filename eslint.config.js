import css from "@eslint/css";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import * as regexp from "eslint-plugin-regexp";
import globals from "globals";
import { config, configs } from "typescript-eslint";

/** @type {import('eslint').Config} */
export default config(
	eslint.configs.recommended,
	...configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	jsxA11y.flatConfigs.recommended,
	react.configs.flat.recommended,
	react.configs.flat["jsx-runtime"],
	regexp.configs["flat/recommended"],
	{
		languageOptions: {
			ecmaVersion: "latest",
			globals: {
				...globals.browser,
				...globals.commonjs,
				...globals.es2022,
				...globals.serviceworker,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			sourceType: "module",
		},
		plugins: {
			"react-hooks": reactHooks,
		},
		rules: {
			...react.configs["jsx-runtime"].rules,
			...reactHooks.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": ["warn"],
			"@typescript-eslint/no-unused-vars": [
				"warn", // or "error"
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			"import-x/no-dynamic-require": "warn",
			"import-x/no-nodejs-modules": "warn",
			"no-unused-vars": "off",
			"react/no-unknown-property": [
				"error",
				{
					ignore: ["variant"],
				},
			],
			"react/jsx-sort-props": [
				"warn",
				{
					callbacksLast: false,
					shorthandFirst: false,
					shorthandLast: false,
					multiline: "ignore",
					ignoreCase: true,
					noSortAlphabetically: false,
					reservedFirst: false,
					locale: "auto",
				},
			],
		},
		settings: {
			"import-x/internal-regex": "^~/",
			"import-x/parsers": {
				"typescript-eslint": [".ts", ".tsx"],
			},
			"import-x/resolver": {
				node: true,
				typescript: true,
			},
			react: {
				version: "detect",
			},
		},
	},
	{
		ignores: [
			"**/+types/*",
			"**/build/*",
			"**/dist/*",
			"**/generated/*",
			"**/node_modules/*",
			"app/types/*",
		],
	},
	{
		files: ["**/*.css"],
		language: "css/css",
		...css.configs.recommended,
	},
	prettier,
);
