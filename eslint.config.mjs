import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
//noinspection SpellCheckingInspection
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    extends: ["js/recommended"],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        actor: "readonly",
        CONFIG: "readonly",
        Handlebars: "readonly",
        Hooks: "readonly",
        PIXI: "readonly",
        TERIOCK: "readonly",
        foundry: "readonly",
        game: "readonly",
        scope: "readonly",
        tm: "readonly",
      },
    },
    plugins: { js },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  tseslint.configs.recommended,
]);
