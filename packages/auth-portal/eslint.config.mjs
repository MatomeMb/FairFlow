import tsParser from '@typescript-eslint/parser';

export default [
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: 'Literal[value=/bg-(red|blue|green|yellow|emerald|stone)/]',
					message: 'Use semantic tokens instead of Tailwind colors',
				},
			],
		},
	},
];
