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
    if (!command) {
      logger.error(`${this.command} 命令不存在`)
      logger.info('npx i18n init: 初始化配置文件')
      logger.info('npx i18n translate: 生成语言包')
      logger.info('npx i18n genExport: 生成导出文件')
      return
    }
    command.run()
  }
}
