module.exports = {
  root: true,
  env: { es2016: true, node: true, browser: true },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  ignorePatterns: ["node_modules", "dist"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-var-requires": 0,
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
      },
    ],
  },
  globals: {
    NodeJS: true,
  },
};
