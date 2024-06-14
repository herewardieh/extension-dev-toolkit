import type { Config } from "jest";

const config: Config = {
  verbose: true,
  testEnvironment: "node",
  testRegex: ".*/(__tests__|tests)/.+\\.(generator|test|spec)\\.(ts|tsx)$",
  testPathIgnorePatterns: ["/node_modules/"],
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "@extension-dev-packages/extension-cli":
      "<rootDir>/@extension-dev-packages/extension-cli/src/cli",
    "@extension-dev-packages/pack-bundle":
      "<rootDir>/@extension-dev-packages/pack-bundle/src/cli",
  },
};

export default config;
