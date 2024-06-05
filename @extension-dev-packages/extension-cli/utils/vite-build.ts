import react from "@vitejs/plugin-react-swc";
import { build } from "vite";
import { keys, map, join } from "lodash-es";
import { Extension } from "../src/type";
import { resolve } from "path";
import { cwd } from "process";
import mvBundleFile from "./vite-plugin-mvbundle";
import fse from "fs-extra";
import { logger } from "./logger";

const targetPath = resolve(cwd(), "target-plugin");

const buildPage = async (pageUi: Extension.TPageUI) => {
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

const buildScripts = async (scripts: Extension.IScripts[]) => {
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

const copyAssets = () => {
  fse.copy(resolve(cwd(), "assets"), resolve(targetPath, "assets"));
};

export const buildProject = async (
  page_ui: Extension.TPageUI,
  scripts: Extension.IScripts[],
) => {
  await buildPage(page_ui);
  await buildScripts(scripts);
  copyAssets();
};
