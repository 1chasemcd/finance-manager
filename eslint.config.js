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
    "eslint.config.js",
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
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          defaultProject: "apps/web/tsconfig.json",
        },
      },
    },
  },
  {
    files: ["apps/api/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          defaultProject: "apps/api/tsconfig.json",
        },
      },
    },
    rules: {
      "@typescript-eslint/triple-slash-reference": [
        "error",
        { path: "always" },
      ],
    },
  },
  {
    files: ["packages/client/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          defaultProject: "packages/client/tsconfig.json",
        },
      },
    },
  },
  {
    files: ["packages/result/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          defaultProject: "packages/result/tsconfig.json",
        },
      },
    },
  },
]);
