import { cwd } from "process";
import { dirname, join, resolve } from "path";
import { logger } from "./logger";
import { existsSync, writeFileSync } from "fs";
import { OutputOptions, rollup } from "rollup";
import { resolveRoot, handleDeps } from "./utils";
import typescript from "@rollup/plugin-typescript";
import { createMonoExternal } from "./rollupCreateMonoExternal";
import replace from "@rollup/plugin-replace";
import { readPackage } from "read-pkg";
import { generateDts } from "./generate-dts";
import dts from "rollup-plugin-dts";
import { isEmpty, uniq } from "lodash-es";
import yargs from "yargs";

const output = {
  dir: ".",
  types: "./dist/index.d.ts",
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
};

export const main = async (currWorkDir = cwd()) => {
  const opt = await yargs(process.argv.slice(2)).argv;
  const assignDir = opt?._?.[0] as string;
  if (assignDir) currWorkDir = resolve(assignDir);

  const monoRoot = resolveRoot(currWorkDir);
  const indexTsFile = join(currWorkDir, "index.ts");

  if (!existsSync(indexTsFile)) {
    return logger.error("Not found javascript file entry point.");
  }

  const pkg = await readPackage({ cwd: currWorkDir });

  const monoPkg = await readPackage({ cwd: monoRoot });

  const rollupReplace: Record<string, string> =
    pkg.packBundle?.rollupReplace || {};

  const sideEffects: string[] = pkg.packBundle?.sideEffects || [];

  const autoExternal = createMonoExternal(monoRoot, pkg);

  // generate mjs and cjs files
  const jsFileOutputOptions = [
    {
      dir: join(currWorkDir, dirname(output.module)),
      format: "es",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name]-[hash].mjs",
    },
    {
      dir: join(currWorkDir, dirname(output.main)),
      format: "cjs",
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name]-[hash].cjs",
      exports: "named",
    },
  ] as OutputOptions[];
  logger.info("start bundling mjs and cjs files...");
  await rollup({
    input: join(currWorkDir, output.dir, "index.ts"),
    output: jsFileOutputOptions,
    plugins: [
      autoExternal(),
      typescript(),
      replace({
        preventAssignment: true,
        ...rollupReplace,
      }),
    ],
  }).then((bundle) => {
    jsFileOutputOptions.forEach((output) => {
      bundle.write(output);
    });
  });
  logger.success("mjs and js files bundled success.");

  // generate index.d.ts file
  const tsDocOutputOptions = [
    {
      file: join(currWorkDir, output.types),
      format: "es",
    },
  ] as OutputOptions[];
  logger.info("start generating index.d.ts file...");
  const dtsEntry = await generateDts(monoRoot, join(currWorkDir, output.dir));
  rollup({
    input: dtsEntry,
    output: tsDocOutputOptions,
    plugins: [autoExternal(), dts()],
  }).then((bundle) => {
    tsDocOutputOptions.forEach((output) => {
      bundle.write(output);
    });
  });
  logger.success("index.d.ts bundled success.");

  // generate package.json file for publish
  logger.info("start building package.json...");
  const usedPkgs = uniq([...autoExternal.usedPkgs, ...sideEffects]);
  const repoDependencies = {
    ...handleDeps(usedPkgs, pkg).repoDependencies,
    ...handleDeps(usedPkgs, monoPkg).repoDependencies,
  };
  const repoPeerDependencies = {
    ...handleDeps(usedPkgs, pkg).repoPeerDependencies,
    ...handleDeps(usedPkgs, monoPkg).repoPeerDependencies,
  };
  const template = {
    ...pkg,
    type: "module",
    main: output.main,
    module: output.module,
    exports: {
      [output.dir]: {
        require: output.main,
        import: output.module,
        types: output.types,
      },
      "./index.ts": "./index.ts",
    },
    files: uniq([...pkg.files, "dist/", join(output.dir, "./index.d.ts")]),
    dependencies: isEmpty(autoExternal.usedPkgs) ? undefined : repoDependencies,
    peerDependencies: isEmpty(pkg.peerDependencies)
      ? undefined
      : repoPeerDependencies,
    scripts: {
      ...pkg.scripts,
      prepublishOnly: "../../node_modules/.bin/pack-bundle",
    },
    readme: undefined,
    repository: {
      type: "git",
      url: "https://github.com/herewardieh/extension-dev-toolkit.git",
    },
  };
  writeFileSync(
    join(currWorkDir, "package.json"),
    `${JSON.stringify(template, null, 2)}`,
  );
  logger.success("package.json file generated success.");
};
