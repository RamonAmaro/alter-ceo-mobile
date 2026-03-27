// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  ...expoConfig,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",

      // No console / debug logging
      "no-console": "error",

      // Enforce const over let
      "prefer-const": "error",

      // No var
      "no-var": "error",

      // No unused variables
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Explicit return types on module-level functions
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // No explicit any
      "@typescript-eslint/no-explicit-any": "warn",

      // No empty catch blocks
      "no-empty": ["error", { allowEmptyCatch: false }],

      // React
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
    },
  },
  {
    ignores: ["dist/*", "node_modules/*", ".expo/*"],
  },
]);
