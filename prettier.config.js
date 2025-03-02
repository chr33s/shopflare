/** @type {import("prettier").Config} */
export default {
	importOrder: ["<THIRD_PARTY_MODULES>", "^(./+|~/*|[./])"],
	importOrderSeparation: true,
	overrides: [
		{
			files: "*.svg",
			options: { parser: "html" },
		},
	],
	plugins: [
		"prettier-plugin-packagejson",
		"@trivago/prettier-plugin-sort-imports",
	],
};
