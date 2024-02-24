import chalk from 'chalk'

type ColorType = typeof chalk.Color

class Logger {
  info(msg: string, color: ColorType = 'blue', isBold: boolean = false) {
    if (isBold) {
      console.log(chalk[color].bold(msg))
    } else {
      console.log(chalk[color](msg))
    }
  }

  warning(msg: string) {
    console.log(chalk.yellow(`${chalk.bold('Warning: ')}${msg}`))
  }

  error(msg: string | Error) {
    msg = msg instanceof Error ? msg.message : msg
    console.log(chalk.red(`${chalk.bold('Error: ')}${msg}`))
  }
}

export const logger = new Logger()
