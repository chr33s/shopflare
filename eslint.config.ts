import shopifyEslintPlugin from '@shopify/eslint-plugin';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
	globalIgnores([
		'.react-router',
		'**/.shopify',
		'**/.wrangler',
		'**/dist/*',
		'**/generated/*',
		'app/types/*',
		'build',
		'node_modules',
		'worker-configuration.d.ts',
	]),
	...shopifyEslintPlugin.configs.typescript,
	...shopifyEslintPlugin.configs.react,
	...shopifyEslintPlugin.configs.prettier,
	{
		rules: {
			'@shopify/strict-component-boundaries': 'off',
			'@shopify/jsx-no-hardcoded-content': 'off',
			// enables Header({ 'Content-Type' })
			'@typescript-eslint/naming-convention': [
				'error',
				{
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
					format: null,
					modifiers: ['requiresQuotes'],
				},
			],
			'id-length': [
				'error',
				{
					exceptions: ['_', 'a', 'b', 'i', 'k', 't', 'v', 'z', '$'],
				},
			],
			'import-x/extensions': 'off',
			'no-console': 'off',
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'react/react-in-jsx-scope': 'off',
		},
	},
]);
