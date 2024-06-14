import { Plugin } from "vite";
import { Extension } from "../src/type";
import { keys } from "lodash-es";
import path from "path";
import { moveFile } from "move-file";
import { rimrafSync } from "rimraf";
import { existsSync } from "fs";
import { cwd } from "process";

export default function mvBundleFile(
  pageUi: Extension.TPageUI,
  targetPath: string,
): Plugin {
  const projectRoot = cwd();

  const files: Record<string, string>[] = keys(pageUi).map((name) => {
    const entryPointPath = pageUi[name as Extension.TPageUIType];
    const targetPointPath = path.resolve(
      targetPath,
      path.relative(projectRoot, entryPointPath),
    );
    return { [`${name}.html`]: targetPointPath };
  });

  return {
    name: "vite-plugin-mvbundle",
    closeBundle: async () => {
      for (let file of files) {
        const to = keys(file)[0];
        const from = file[to];
        await moveFile(from, path.resolve(targetPath, to));
        const deletePath = path.resolve(
          targetPath,
          path.relative(targetPath, from).split(path.sep)?.[0],
        );
        if (existsSync(deletePath)) rimrafSync(deletePath);
      }
    },
  };
}
