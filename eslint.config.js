// @ts-check

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".git/",
    "**/node_modules/",
    "**/build/",
    "**/dist/",
    "**/.vite/",
    "**/.wrangler/",
    "**/worker-configuration.d.ts",
  ]),
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
          defaultProject: "tsconfig.json",
        },
      },
    },
  },

  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["apps/api/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/triple-slash-reference": ["error", { path: "always" }],
    },
  },
]);
