import chalk from "chalk";

export const logger = {
  error: (msg: string) => console.log(chalk.redBright(msg)),
  success: (msg: string) => console.log(chalk.greenBright(msg)),
  warning: (msg: string) => console.log(chalk.yellowBright(msg)),
  info: (msg: string) => console.log(chalk.blueBright(msg)),
  list: (msg: string) => console.log(chalk.whiteBright(msg)),
};
