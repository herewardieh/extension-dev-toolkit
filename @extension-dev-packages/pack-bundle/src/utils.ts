import { existsSync } from "fs";
import { forEach } from "lodash-es";
import { join } from "path";
import { NormalizedPackageJson } from "read-pkg";

export const resolveRoot = (p: string): string => {
  const pnpmWorkspaceYAML = join(p, "./pnpm-workspace.yaml");

  if (!existsSync(pnpmWorkspaceYAML)) {
    return resolveRoot(join(p, "../"));
  }

  return p;
};

export const handleDeps = (pkgNames: string[], pkg: NormalizedPackageJson) => {
  let repoDependencies: Record<string, string> = {};
  let repoPeerDependencies: Record<string, string> = {};
  forEach(pkgNames, (pkgName) => {
    if (pkg.dependencies?.[pkgName]) {
      repoDependencies[pkgName] = pkg.dependencies[pkgName];
    }
    if (pkg.peerDependencies?.[pkgName]) {
      repoPeerDependencies[pkgName] = pkg.peerDependencies[pkgName];
    }
  });
  return { repoDependencies, repoPeerDependencies };
};
