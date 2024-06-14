import { main as packBundle } from "@extension-dev-packages/pack-bundle";
import { dirname, join } from "path";
import { beforeEach, describe, it } from "@jest/globals";
import { fileURLToPath } from "url";
import { rimrafSync } from "rimraf";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("pack bundle unit test", () => {
  beforeEach(() => {
    rimrafSync(join(__dirname, "..", "/dist"));
  });

  it("bundle repo", async () => {
    await packBundle(join(__dirname, ".."));
  });
});
