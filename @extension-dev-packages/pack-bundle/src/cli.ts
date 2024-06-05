import { cwd } from "process";
import { dirname, join } from "path";
import { logger } from "./logger.js";
import { existsSync, writeFileSync } from "fs";
import { OutputOptions, rollup } from "rollup";
import { resolveRoot, handleDeps } from "./utils.js";
import typescript from "@rollup/plugin-typescript";
import { createMonoExternal } from "./createMonoExternal.js";
import replace from "@rollup/plugin-replace";
import { readPackage } from "read-pkg";
import { generateDts } from "./generateDts.js";
import dts from "rollup-plugin-dts";
import { isEmpty, uniq } from "lodash-es";

const output = {
  dir: ".",
  types: "./dist/index.d.ts",
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
};

export const main = async () => {
  const monoRoot = resolveRoot(cwd());
  const indexTsFile = join(cwd(), "index.ts");
  if (!existsSync(indexTsFile))
    return logger.error("Not found entry point, please check!");
  const pkg = await readPackage();
  const monoPkg = await readPackage({ cwd: monoRoot });

  const rollupReplace: Record<string, string> =
    pkg.packBundle?.rollupReplace || {};

  const sideEffects: string[] = pkg.packBundle?.sideEffects || [];

  const jsFileOutputOptions = [
    {
      dir: join(cwd(), dirname(output.module)),
      format: "es",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name]-[hash].mjs",
    },
    {
      dir: join(cwd(), dirname(output.main)),
      format: "cjs",
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name]-[hash].cjs",
      exports: "named",
    },
  ] as OutputOptions[];
  const autoExternal = createMonoExternal(monoRoot, pkg);
  // generate mjs and cjs file
  logger.info("start bundling mjs and cjs file...");
  await rollup({
    input: join(cwd(), output.dir, "index.ts"),
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
  logger.success("mjs and cjs bundled success.");

  // generate index.d.ts file
  const tsDocOutputOptions = [
    {
      file: join(cwd(), output.types),
      format: "es",
    },
  ] as OutputOptions[];
  logger.info("start global index.d.ts file...");
  const index = await generateDts(monoRoot, join(cwd(), output.dir));
  rollup({
    input: index,
    output: tsDocOutputOptions,
    plugins: [autoExternal(), dts()],
  }).then((bundle) => {
    tsDocOutputOptions.forEach((output) => {
      bundle.write(output);
    });
  });
  logger.success("global index.d.ts bundled success.");
  // generate package.json file for publish
  logger.info("start building package json file...");

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
  };
  writeFileSync(
    join(cwd(), "package.json"),
    `${JSON.stringify(template, null, 2)}`,
  );
  logger.success("package.json file generated success.");
};
