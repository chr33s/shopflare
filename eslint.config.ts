import graphqlPlugin from '@graphql-eslint/eslint-plugin';
import shopifyEslintPlugin from '@shopify/eslint-plugin';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
	globalIgnores([
		'.react-router',
		'.shopify',
		'.wrangler',
		'**/dist/*',
		'**/generated/*',
		'app/types/*',
		'build',
		'node_modules',
		'worker-configuration.d.ts',
	]),
	...shopifyEslintPlugin.configs.typescript,
	...shopifyEslintPlugin.configs['typescript-type-checking'],
	...shopifyEslintPlugin.configs.react,
	...shopifyEslintPlugin.configs.prettier,
	{
		languageOptions: {
			parserOptions: {
				project: 'tsconfig.json',
			},
		},
	},
	{
		ignores: ['**/*.gql'],
		rules: {
			'@shopify/jsx-no-hardcoded-content': 'off',
			'@shopify/strict-component-boundaries': 'off',
			// enables Header({ 'Content-Type' })
			'@typescript-eslint/naming-convention': [
				'error',
				{
					format: null,
					modifiers: ['requiresQuotes'],
					selector: [
						'classProperty',
						'objectLiteralProperty',
						'typeProperty',
						'classMethod',
						'objectLiteralMethod',
						'typeMethod',
						'accessor',
						'enumMember',
					],
				},
			],
			'id-length': [
				'error',
				{
					exceptions: ['_', 'a', 'b', 'i', 'k', 't', 'v', 'z', '$'],
				},
			],
			'import-x/extensions': 'off',
			'import-x/order': [
				'error',
				{
					alphabetize: {
						caseInsensitive: true,
						order: 'asc',
					},
					groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
					named: true,
					pathGroups: [
						{
							group: 'parent',
							pattern: '#app/**',
							position: 'before',
						},
					],
				},
			],
			'no-console': 'off',
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'react-hooks/react-compiler': 'error',
			'react/react-in-jsx-scope': 'off',
			'sort-keys': ['error', 'asc', {caseSensitive: false}],
			'sort-vars': 'error',
		},
	},
	{
		files: ['**/*.gql'],
		languageOptions: {parser: graphqlPlugin.parser},
		plugins: {'@graphql-eslint': graphqlPlugin},
		rules: {
			'spaced-comment': 'off',
		},
	},
]);
