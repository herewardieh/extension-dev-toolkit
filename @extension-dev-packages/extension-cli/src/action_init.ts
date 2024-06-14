import inquirer from "inquirer";
import { kebabCase } from "lodash-es";
import { join, resolve } from "path";
import { temporaryDirectory } from "tempy";
import { cwd } from "process";
import { spawnSync } from "child_process";
import fse from "fs-extra";
import { rimrafSync } from "rimraf";
import { logger } from "../utils/logger";

const TEMPLATE_GIT_ADDR =
  "https://github.com/herewardieh/extension-boilerplate-template.git";

const downloadTemplate = () => {
  const tempDirectory = temporaryDirectory();
  try {
    spawnSync("git", ["clone", "--depth", "1", TEMPLATE_GIT_ADDR, "."], {
      stdio: "inherit",
      cwd: tempDirectory,
    });
  } catch (error: any) {
    if (error.errno === "ENOENT") {
      throw new Error("git not found in PATH");
    }
  }
  return tempDirectory;
};

const getPackageManager = (): string => {
  const managers = ["pnpm", "yarn", "npm"];
  for (let manager of managers) {
    try {
      spawnSync(manager, ["--version"]);
      return manager;
    } catch (error: any) {
      logger.error(`Not found package manager ${manager} in PATH.`);
    }
  }
  return null;
};

const installDependencies = (downloadDirPath: string) => {
  try {
    const packageManagerName = getPackageManager();
    if (!packageManagerName) return;
    spawnSync(packageManagerName, ["install"], {
      cwd: downloadDirPath,
      stdio: "inherit",
    });
  } catch (error: any) {
    logger.error(error.message);
  }
};

export const actionInit = async (currWorkDir = cwd()) => {
  const { data: rawName } = await inquirer.prompt({
    name: "data",
    prefix: "---EXTENSION CLI---\n",
    message: "Extension name:",
  });
  const projectDirectory = resolve(currWorkDir, kebabCase(rawName));
  logger.info("Downloading template files from git...");
  const downloadDirPath = downloadTemplate();
  logger.info(`Creating new project from ${projectDirectory}`);
  logger.info("Installing dependencies...");
  installDependencies(downloadDirPath);
  fse.copySync(downloadDirPath, projectDirectory);
  rimrafSync(join(projectDirectory, ".git"));
  rimrafSync(downloadDirPath);
  logger.success("New project created success.");
};
