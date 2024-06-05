import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { relative, join } from "path";
import { rimrafSync } from "rimraf";
import { logger } from "./logger.js";

const runGenerate = async (
  projectRoot: string,
  tmpDir: string,
): Promise<void> => {
  if (existsSync(tmpDir)) rimrafSync(tmpDir);
  mkdirSync(tmpDir, { recursive: true });
  logger.info(`typescript compiling ....`);
  try {
    const output = execSync("npx tsc", {
      cwd: projectRoot,
    });
    logger.success("typescript files compiling success.");
    logger.info(`information as below: `);
    logger.list(String(output));
  } catch (e) {
    logger.error("typescript files compiling fail:" + String(e));
  }
  return Promise.resolve();
};

export const generateDts = async (
  monoRoot: string,
  cwd: string,
): Promise<string> => {
  const monoPkg = relative(monoRoot, cwd);

  const tmpRoot = join(monoRoot, ".tmp");

  await runGenerate(monoRoot, tmpRoot);

  return join(monoRoot, ".tmp", monoPkg, "index.d.ts");
};
