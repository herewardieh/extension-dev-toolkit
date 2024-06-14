import { Plugin } from "rollup";
import { NormalizedPackageJson, readPackageSync } from "read-pkg";

const builtIns = (
  process as NodeJS.Process & { binding(_: string): Record<string, any> }
).binding("natives");

const builtins = Object.keys(builtIns);

export const createMonoExternal = (
  monoRoot: string,
  pkg: NormalizedPackageJson,
) => {
  let deps: string[] = [];

  if (pkg.dependencies) {
    deps = deps.concat(Object.keys(pkg.dependencies));
  }

  if (pkg.peerDependencies) {
    deps = deps.concat(Object.keys(pkg.peerDependencies));
  }

  const monoPkg = readPackageSync({ cwd: monoRoot });

  if (monoPkg.dependencies) {
    deps = deps.concat(Object.keys(monoPkg.dependencies));
  }

  if (monoPkg.peerDependencies) {
    deps = deps.concat(Object.keys(monoPkg.peerDependencies));
  }

  const usedPkgs: string[] = [];

  const autoExternal = (): Plugin => {
    return {
      name: "rollup-plugin-monorepo-auto-external",
      options: (opts) => {
        const external = (
          id: string,
          importer: string | undefined,
          isResolved: boolean,
        ) => {
          if (
            typeof opts.external === "function" &&
            opts.external(id, importer, isResolved)
          ) {
            return true;
          }
          if (Array.isArray(opts.external) && opts.external.includes(id)) {
            return true;
          }

          if (!(id.startsWith(".") || id.startsWith("/"))) {
            const isDep = deps.some((idx) => id.startsWith(idx));
            const isBuiltIn = builtins.some((idx: string) =>
              id.startsWith(idx),
            );
            if (isDep && !usedPkgs.includes(id)) usedPkgs.push(id);
            return isDep || isBuiltIn;
          }
          return false;
        };
        return Object.assign({}, opts, { external });
      },
    };
  };

  autoExternal.usedPkgs = usedPkgs;

  return autoExternal;
};
