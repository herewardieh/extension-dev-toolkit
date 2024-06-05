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
import { map, uniq, values } from "lodash-es";
import { nanoid } from "nanoid";

const checkFileExists = (filePath: string) => {
  const settingFileExists = existsSync(filePath);
  if (!settingFileExists) {
    throw Error("No Configuration File!!!");
  }
};

export async function actionDev(release: boolean) {
  // read configuration from setting file
  const settingFilePath = resolve(cwd(), ".extension.setting.json");
  checkFileExists(settingFilePath);
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
  // get neccessary information from configuration fields
  const scripts: Extension.IScripts[] = [
    {
      name: "background",
      compileName: "background script --- index.ts",
      entry_point: background_script,
    },
  ];
  for (const rule of content_scripts_inject_rules) {
    const pathInfo = pathParse(rule.entry_point);
    scripts.push({
      name: `${pathInfo.name}.${nanoid(8)}`,
      compileName: `content script --- ${pathInfo.name}${pathInfo.ext}`,
      entry_point: rule.entry_point,
    });
  }
  // start to build page part and scripts
  await buildProject(page_ui, scripts);
  generateManifest(application_manifest, page_ui);
  const pageRoots = map(values(page_ui), (path: string) => {
    return pathParse(path).dir;
  });
  const bgScriptRoots = [pathParse(background_script).dir];
  const contentScriptRoots = map(content_scripts_inject_rules, (rule) => {
    return pathParse(rule.entry_point).dir;
  });
  // enable hot reload server if it is not in release mode
  if (!release)
    enableHotReloadMode(
      () => buildProject(page_ui, scripts),
      uniq([...pageRoots, ...bgScriptRoots, ...contentScriptRoots]),
    );
}
