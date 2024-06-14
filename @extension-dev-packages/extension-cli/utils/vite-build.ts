import react from "@vitejs/plugin-react-swc";
import { build } from "vite";
import { keys, map, join, isEmpty } from "lodash-es";
import { Extension } from "../src/type";
import { resolve } from "path";
import mvBundleFile from "./vite-plugin-mvbundle";
import fse from "fs-extra";
import { logger } from "./logger";
import { existsSync } from "fs";

const buildPage = async (pageUi: Extension.TPageUI, targetPath: string) => {
  logger.info(
    `start to package your pages... ${join(
      map(keys(pageUi), (type) => type),
      ",",
    )}`,
  );
  const assetsFileName = "[name].[hash].[ext]";
  const fileName = "[name].[hash].js";

  await build({
    build: {
      rollupOptions: {
        input: pageUi,
        output: {
          assetFileNames: assetsFileName,
          entryFileNames: fileName,
          chunkFileNames: fileName,
        },
      },
      outDir: targetPath,
    },
    plugins: [react(), mvBundleFile(pageUi, targetPath)],
  });
};

const buildScripts = async (
  scripts: Extension.IScripts[],
  targetPath: string,
) => {
  for (const script of scripts) {
    logger.info(`start to package your script - ${script.compileName}`);
    await build({
      build: {
        rollupOptions: {
          input: {
            [script.name]: script.entry_point,
          },
          output: {
            entryFileNames: `[name].js`,
          },
        },
        outDir: targetPath,
        emptyOutDir: false,
      },
    });
  }
};

const copyAssets = (targetPath: string) => {
  const currWorkDir = resolve(targetPath, "..");
  const assetDir = resolve(currWorkDir, "assets");
  if (existsSync(assetDir)) {
    fse.copy(assetDir, resolve(targetPath, "assets"));
  }
};

export const buildProject = async (
  page_ui: Extension.TPageUI,
  scripts: Extension.IScripts[],
  targetPath: string,
) => {
  if (!isEmpty(page_ui)) await buildPage(page_ui, targetPath);
  await buildScripts(scripts, targetPath);
  copyAssets(targetPath);
};
