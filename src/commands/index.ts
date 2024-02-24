import { getConfiguration, logger } from '../utils'
import GenExport from './GenExport'
import { Init } from './Init'
import { Translate } from './Translate'

type CommandType = 'init' | 'translate'

export class I18nCommand {
  constructor(private command: CommandType) {}
  run() {
    let config = this.command == 'init' ? {} : getConfiguration()
    const commandMap = {
      init: new Init(),
      translate: new Translate(config),
      genExport: new GenExport(config)
    }
    let command = commandMap[this.command]
    if (!command) return logger.error(`${this.command}命令不存在`)
    command.run()
  }
}
