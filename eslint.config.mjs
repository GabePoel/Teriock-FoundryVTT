import { defineConfig, globalIgnores } from "eslint/config";
import htmlEslint from "@html-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import parser from "@html-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["foundry/**/*"]),
  {
    // JavaScript files - use Prettier for formatting
    files: ["**/*.js", "**/*.mjs"],
    extends: compat.extends("eslint:recommended"),
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...prettierConfig.rules,
      "no-undef": "off",
      "no-unused-vars": 0,
      "no-prototype-builtins": "error",
      "no-useless-escape": "error",

      "max-len": [
        "error",
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
    },
  },
  {
    // Handlebars/HTML files - use @stylistic for formatting
    files: ["**/*.hbs", "**/*.html"],
    extends: compat.extends("plugin:@html-eslint/recommended"),
    plugins: {
      "@html-eslint": htmlEslint,
      "@stylistic": stylistic,
    },
    languageOptions: {
      parser: parser,
    },
    rules: {
      "@html-eslint/attrs-newline": [
        "off",
        {
          closeStyle: "sameline",
          ifAttrsMoreThan: 9,
        },
      ],

      // Align with Prettier settings: tabWidth: 2
      "@html-eslint/indent": ["error", 2],

      "@stylistic/indent": [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],

      // Align with Prettier settings: singleQuote: false
      "@stylistic/quotes": ["error", "double"],

      // Align with Prettier settings: semi: true
      "@stylistic/semi": ["error", "always"],

      // Align with Prettier settings: bracketSpacing: true
      "@stylistic/object-curly-spacing": ["error", "always"],

      // Align with Prettier settings: trailingComma: "all"
      "@stylistic/comma-dangle": ["error", "always-multiline"],

      "@stylistic/space-in-parens": ["error", "never"],
      "@stylistic/key-spacing": "error",
      "@stylistic/comma-spacing": ["error"],
      "@stylistic/space-before-blocks": 2,
      "@stylistic/eol-last": ["error", "always"],
    },
  },
  {
    // TypeScript files - use Prettier for formatting
    files: ["**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      ...prettierConfig.rules,
      "no-prototype-builtins": "error",
      "no-useless-escape": "error",
      "max-len": [
        "error",
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
    },
  },
]);
