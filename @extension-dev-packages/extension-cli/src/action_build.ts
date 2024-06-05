import { resolve, relative } from "path";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { cwd } from "process";
import jszip from "jszip";
import { rimrafSync } from "rimraf";
import { actionDev } from "./action_dev";

const getFiles = (dir: string) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const res = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFiles(res));
    } else {
      files.push(res);
    }
  }
  return files;
};

const compressFile2Zip = async (srcPath: string, outPath: string) => {
  const files = getFiles(srcPath);
  for (const filePath of files) {
    const content = readFileSync(filePath);
    const relativePath = relative(srcPath, filePath);
    jszip.file(relativePath, content);
  }
  const zipBuffer = await jszip.generateAsync({ type: "nodebuffer" });
  writeFileSync(outPath, zipBuffer);
};

export const actionBuild = async () => {
  await actionDev(true);
  const outPath = resolve(cwd(), "target-plugin.zip");
  rimrafSync(outPath);
  compressFile2Zip(resolve(cwd(), "target-plugin"), outPath);
};
