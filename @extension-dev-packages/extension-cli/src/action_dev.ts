import { existsSync, readFileSync } from "fs";
import jjuParse from "jju";
import { resolve } from "path";
import { cwd } from "process";
import { IManifest } from "@extension-dev-packages/types-extension-manifest";
import { Extension } from "./type";
import { buildProject } from "../utils/vite-build";
import { generateManifest } from "../utils/generate-manifest";
import { enableHotReloadMode } from "../utils/hot-reload-server";
import pathParse from "path-parse";
import { keys, map, uniq, values } from "lodash-es";
import { nanoid } from "nanoid";
import { logger } from "../utils/logger";

const checkFileExists = (filePath: string, info: string) => {
  const settingFileExists = existsSync(filePath);
  if (!settingFileExists) {
    throw Error(info);
  }
};

export async function actionDev(release: boolean, currWorkDir = cwd()) {
  // read configuration from setting file
  const settingFilePath = resolve(currWorkDir, ".extension.setting.json");
  checkFileExists(settingFilePath, "No Configuration File!");

  const settingConfig = readFileSync(settingFilePath, "utf8");
  const setting: {
    application_manifest: IManifest;
    content_scripts_inject_rules: Extension.IContentScriptInjectRule[];
    background_script: string;
    page_ui: Extension.TPageUI;
  } = jjuParse.parse(settingConfig);
  const {
    application_manifest,
    content_scripts_inject_rules,
    background_script,
    page_ui,
  } = setting;

  // check neccessary information from configuration fields
  let scripts: Extension.IScripts[] = [];
  if (background_script) {
    const backgroundScriptFilePath = resolve(currWorkDir, background_script);
    if (existsSync(backgroundScriptFilePath)) {
      scripts.push({
        name: "background",
        compileName: "background script --- index.ts",
        entry_point: backgroundScriptFilePath,
      });
    } else {
      logger.warning("Invalid background script building path.");
    }
  } else {
    logger.info("No background script configuration.");
  }

  if (content_scripts_inject_rules) {
    for (const rule of content_scripts_inject_rules) {
      const pathInfo = pathParse(rule.entry_point);
      const contentScriptItemFilePath = resolve(currWorkDir, rule.entry_point);
      if (existsSync(contentScriptItemFilePath)) {
        scripts.push({
          name: `${pathInfo.name}.${nanoid(8)}`,
          compileName: `content script --- ${pathInfo.name}${pathInfo.ext}`,
          entry_point: contentScriptItemFilePath,
        });
      } else {
        logger.warning(
          `Invalid content script --- ${pathInfo.name} building path`,
        );
      }
    }
  } else {
    logger.info("No content script configuration.");
  }

  let pageBuild: Extension.TPageUI = {} as Extension.TPageUI;
  if (page_ui) {
    for (let key of keys(page_ui)) {
      if (["popup", "options", "sidePanel"].includes(key)) {
        const uiPath = resolve(currWorkDir, page_ui[key]);
        if (existsSync(uiPath)) {
          pageBuild[key] = uiPath;
        } else {
          logger.warning(`Invalid page building path`);
        }
      } else {
        logger.warning(
          `Invalid ui key: ${key} only support page building as follow: popup.html options.html sidePanel.html`,
        );
      }
    }
  } else {
    logger.info("No page ui configuration.");
  }

  // start to build page part and scripts
  const targetPath = resolve(currWorkDir, "target-plugin");
  await buildProject(pageBuild, scripts, targetPath);
  generateManifest(application_manifest, pageBuild, targetPath);
  // get files which need to watch
  const scriptRoots = map(
    scripts,
    (script) => pathParse(script.entry_point).dir,
  );
  const pageRoots = map(
    values(pageBuild),
    (pagePath) => pathParse(pagePath).dir,
  );
  // enable hot reload server
  if (!release)
    enableHotReloadMode(
      () => buildProject(pageBuild, scripts, currWorkDir),
      uniq([...pageRoots, ...scriptRoots]),
    );
}
