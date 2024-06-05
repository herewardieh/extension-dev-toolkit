import { execSync } from "child_process";

export const bootstrap = async () => {
  execSync(`rm -rf ./dist`);
  execSync(`npx tsc --project ./tsconfig.json`);
};

bootstrap().catch((err) => {
  console.error(err);
});
