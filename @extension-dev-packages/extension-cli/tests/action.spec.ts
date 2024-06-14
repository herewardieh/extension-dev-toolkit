import { dirname, join } from "path";
import { afterAll, describe, it, jest } from "@jest/globals";
import { fileURLToPath } from "url";
import { rimrafSync } from "rimraf";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEMPLATE_WORK_DIR = "template-work-dir";

const testsDir = join(__dirname, "..", "..", "..", "test-work-dir");

jest.unstable_mockModule("inquirer", () => ({
  default: {
    prompt: jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: TEMPLATE_WORK_DIR })),
  },
}));

describe("extension cli development unit test", () => {
  it("action init test", async () => {
    const { actionInit } = await import("../src/action_init");
    await actionInit(testsDir);
  });
  it("action development test", async () => {
    const { actionBuild } = await import("../src/action_build");
    await actionBuild(join(testsDir, TEMPLATE_WORK_DIR));
  });

  afterAll(() => {
    rimrafSync(testsDir);
  });
});
