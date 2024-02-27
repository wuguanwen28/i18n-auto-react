import fs from 'fs'
import path from 'path'
import { exportTpl, logger, prettierJs } from '../utils'
import { _I18nConfigs } from './Translate'

export default class GenExport {
  params = {}

  constructor(private config: _I18nConfigs) {}

  async genExportFile() {
    let { languages, output, __rootPath } = this.config

    let imports = languages
      .map((name) => {
        let newName = name.replace('-', '_')
        return `import ${newName} from './${name}';`
      })
      .join('\n')

    let resources = languages
      .map((name) => {
        let _name = name.replace('-', '_')
        return `extendLocale('${_name}', ${_name});`
      })
      .join('\n')

    const file = exportTpl
      .replace('$import', imports)
      .replace('$resources', resources)

    let dirPath = output.dir
    let ext = output.ext || 'js'

    let curFilePath = path.resolve(__rootPath, dirPath, `index.${ext}`)
    let code = await prettierJs(file)
    fs.writeFileSync(curFilePath, code, { encoding: 'utf-8' })
  }

  run() {
    this.genExportFile()
    logger.info('\n生成导出文件成功！\n', 'green', true)
  }
}
