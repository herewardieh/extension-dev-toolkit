import { resolve, relative } from "path";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { cwd } from "process";
import JSZip from "jszip";
import { rimrafSync } from "rimraf";
import { actionDev } from "./action_dev";

var zip = new JSZip();

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
    zip.file(relativePath, content);
  }
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  writeFileSync(outPath, zipBuffer);
};

export const actionBuild = async (currWorkDir = cwd()) => {
  await actionDev(true, currWorkDir);
  const outPath = resolve(currWorkDir, "target-plugin.zip");
  if (existsSync(outPath)) rimrafSync(outPath);
  compressFile2Zip(resolve(currWorkDir, "target-plugin"), outPath);
};
