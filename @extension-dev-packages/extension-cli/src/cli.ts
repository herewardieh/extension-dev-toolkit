import { program } from "commander";
import { actionDev } from "./action_dev";
import { actionBuild } from "./action_build";
import { actionInit } from "./action_init";

export const cli = async () => {
  program.version("process.env.APP_VERSION", "-v --version");
  program
    .command("init")
    .description(
      "use the CLI tool to initialize the template files for browser extension development",
    )
    .action(actionInit);
  program
    .command("dev")
    .description("debug browser extension files in developement mode")
    .action(() => actionDev(false));
  program
    .command("build")
    .description(
      "packaging and generating browser extensions for distribution to users",
    )
    .action(() => actionBuild());
  program.parse(process.argv);
};
