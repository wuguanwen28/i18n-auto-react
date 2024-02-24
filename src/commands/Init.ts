import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { configCode, logger } from '../utils'



export class Init {
  genConfigFile() {
    let filePath = resolve(process.cwd(), './i18n.config.js')
    writeFileSync(filePath, configCode, { encoding: 'utf-8' })
  }
  run() {
    this.genConfigFile()
    logger.info('初始配置文件完成')
  }
}
