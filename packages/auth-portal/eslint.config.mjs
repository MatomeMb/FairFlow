import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "max-lines": [
        "error",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/(bg|text|border|ring|from|to|via)-(red|blue|green|yellow|emerald|stone|amber)/]",
          message: "Use semantic tokens instead of Tailwind colors"
        }
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../../../../*"]
        }
      ]
    }
  },
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];
