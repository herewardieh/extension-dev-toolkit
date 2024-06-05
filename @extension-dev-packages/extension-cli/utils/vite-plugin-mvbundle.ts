import { Plugin } from "vite";
import { Extension } from "../src/type";
import { keys, values } from "lodash-es";
import { moveFile } from "move-file";
import { resolve, dirname } from "path";
import { rimrafSync } from "rimraf";
import pathParse from "path-parse";

export default function mvBundleFile(
  pageUi: Extension.TPageUI,
  targetPath: string,
): Plugin {
  const files: Record<string, string>[] = keys(pageUi).map((name) => {
    return { [`${name}.html`]: pageUi[name as Extension.TPageUIType] };
  });

  return {
    name: "vite-plugin-mvbundle",
    closeBundle: async () => {
      for (let file of files) {
        const to = keys(file)?.[0];
        const from = file[to];
        await moveFile(resolve(targetPath, from), resolve(targetPath, to));
      }
      values(pageUi).forEach((filePath) => {
        const dir = pathParse(resolve(targetPath, filePath)).dir;
        rimrafSync(dirname(dir));
      });
    },
  };
}
