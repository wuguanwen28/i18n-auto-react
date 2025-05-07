import { resolve } from 'path'
import { I18nConfigs } from '../type'
import { existsSync, readFileSync } from 'fs'
import {
  DisableRule,
  ERROE_CODE_MAP,
  babelParse,
  createLanguageFile,
  defaultTpl,
  getDefault,
  isCallExpression,
  logger,
  md5Hash,
  readLanguages,
  scanFile,
  sleep,
  tplRegexp,
  zhExt
} from '../utils'
import axios from 'axios'
import crypto from 'crypto'
import { isTSLiteralType } from '@babel/types'
import _traverse from '@babel/traverse'
const traverse = getDefault(_traverse)

type TransResult = Array<{ src: string; dst: string }>
type LanItem = {
  chinese: string
  id: string
  file: string
}
export type _I18nConfigs = I18nConfigs & {
  __rootPath: string
  filePath: string
  warning: boolean
}
export class Translate {
  config: _I18nConfigs
  languages: Record<string, Record<string, string>> = {}
  newLanguages: Record<string, LanItem[]> = {}
  chinese: Record<string, string> = {}
  translateTable = {} // 存放待翻译列表，按语种为key值存放
  translateSource = {} // 按语种为key值存放当前语种已有的语料清单（含已翻译的语料）

  constructor(config: _I18nConfigs) {
    this.config = config
  }

  readLanguagesConfig() {
    const { languages, __rootPath, output, template = defaultTpl } = this.config
    languages.forEach((name) => {
      const { dir, ext = 'js' } = output
      let dirPath = resolve(__rootPath, dir, `${name}.${ext}`)
      if (!existsSync(dirPath)) {
        createLanguageFile(dirPath, template)
        this.languages[name] = {}
      } else {
        this.languages[name] = readLanguages(name, this.config)
      }
      this.newLanguages[name] = []
    })
  }

  readFile() {
    const dir = this.config.entry
    if (typeof dir === 'string') {
      this.readFiles(dir)
    } else if (Array.isArray(dir)) {
      dir.forEach((d) => this.readFiles(d))
    }
  }

  readFiles(dir: string) {
    const __rootPath = this.config.__rootPath
    const dirPath = resolve(__rootPath, dir)
    scanFile(dirPath, this.config, (path) => {
      logger.info(`发现文件: ${path}`)
      const code = readFileSync(path, { encoding: 'utf8' })
      this.babelOpt(code, path)
    })
  }

  babelOpt(code: string, file: string) {
    const importInfo = this.config.importInfo
    const ast = babelParse(code)
    if (!ast) return
    const _this = this

    // 注释禁用
    let disableRule = new DisableRule(ast.comments || [])
    if (disableRule.entireFileDisabled) return

    traverse(ast, {
      // jsx文本： <div>花飘万家雪</div>
      JSXText(path) {
        if (isCallExpression(path, importInfo)) return
        if (disableRule.test(path.node.loc)) return
        if (zhExt.test(path.toString())) {
          const value = path.toString().trim()
          const id = md5Hash(value)
          _this.validateKey(value, id, file)
        }
      },
      // 模板文本： `花飘万家雪${xxx}`
      TemplateLiteral(path) {
        if (isCallExpression(path, importInfo)) return
        if (disableRule.test(path.node.loc)) return
        if (zhExt.test(path.toString())) {
          const node = path.node
          let isCh = false
          node.quasis?.forEach?.(
            (item) => zhExt.test(item.value.raw) && (isCh = true)
          )
          if (isCh) {
            let i = 0
            let value = path
              .toString()
              .replace(/^`|`$/g, '')
              .replace(tplRegexp, () => `{{@${++i}}}`)
            const id = md5Hash(value)
            _this.validateKey(value, id, file)
          }
        }
      },
      // 普通文本： '花飘万家雪'
      StringLiteral(path) {
        // 如果父节点是 ts 则不处理, 如 type AA = '你好' | '大家好'
        if (isTSLiteralType(path.parent)) return
        if (isCallExpression(path, importInfo)) return
        if (disableRule.test(path.node.loc)) return

        if (zhExt.test(path.toString())) {
          const value = path.node.value.toString()
          const id = md5Hash(value)
          _this.validateKey(value, id, file)
        }
      }
    })
  }

  validateKey(zh: string, key: string, file: string) {
    for (let languageKey in this.languages) {
      if (
        !this.languages[languageKey][key] &&
        !this.newLanguages[languageKey].find((n) => n.id === key)
      ) {
        this.newLanguages[languageKey].push({
          chinese: zh,
          id: key,
          file
        })
      }
    }
  }

  createChineseFile() {
    let newData = (this.newLanguages.zh || []).reduce(
      (p, c) => ((p[c.id] = c.chinese), p),
      {} as any
    )
    const { output, template = defaultTpl, __rootPath } = this.config
    let curFilePath = resolve(
      __rootPath,
      output.dir,
      `zh.${output.ext || 'js'}`
    )

    createLanguageFile(
      curFilePath,
      template,
      Object.assign(this.languages.zh, newData)
    )
  }

  // 分割语料，按50个次分割
  sliceWords(words: LanItem[]) {
    const len = words.length
    const res: LanItem[][] = []
    let i = 0
    const resLen = 50
    while (i < len) {
      res.push(words.slice(i, i + resLen))
      i += resLen
    }
    return res
  }

  formatChinese(word) {
    return word.chinese.replace(
      /(\{\{(\@[0-9]+?)\}\})/g,
      (...args: any[]) => args[2]
    )
  }

  async translate() {
    const { server, output, template = defaultTpl, __rootPath } = this.config
    const curQps = server.qps || 1 // 翻译API有QPS限制s

    for (let curLanguage in this.newLanguages) {
      if (curLanguage === 'zh') continue
      const words = this.newLanguages[curLanguage]
      words.length && logger.info(`开始翻译 ${curLanguage}`, 'green', true)
      // 词条分成50个来翻译
      const list = this.sliceWords(words)
      const newData = {}
      for (let item of list) {
        if (!item.length) continue
        const data = await this.requestTranslate(
          item.map((n) => this.formatChinese(n)).join('\n'),
          curLanguage
        )
        for (let i = 0; i < data.length; i++) {
          const target = item.find((n) => this.formatChinese(n) === data[i].src)
          const translated = data[i].dst.replace(
            /\@\s*([0-9]+)/g,
            (_$1, $2) => `{{@${$2}}}`
          )
          if (target) {
            logger.info(`${target.chinese} => ${translated}`, 'white')
            newData[target.id] = translated
          }
        }
        const sleepTime = Math.round(1000 / curQps)
        if (sleepTime > 0) await sleep(sleepTime)
      }

      let curFilePath = resolve(
        __rootPath,
        output.dir,
        `${curLanguage}.${output.ext || 'js'}`
      )

      createLanguageFile(
        curFilePath,
        template,
        Object.assign(this.languages[curLanguage], newData)
      )
    }
  }

  async requestTranslate(
    word: string,
    targetLanguage: string
  ): Promise<TransResult> {
    const { appId, key } = this.config.server
    const salt = Date.now().toString()
    const from = 'zh'
    const to = targetLanguage || 'en'
    const md5 = crypto.createHash('md5')
    // @ts-ignore
    md5.update(Buffer.from(appId + word + salt + key))
    const sign = md5.digest('hex')
    const res = await axios({
      method: 'POST',
      baseURL: 'http://api.fanyi.baidu.com',
      url: '/api/trans/vip/translate',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: { q: word, from, to, salt, sign, appid: appId }
    })
    let trans_result = ''
    if (res.status === 200) {
      if (res.data.error_code) {
        let msg = ERROE_CODE_MAP[res.data.error_code]
        logger.error(msg)
        throw new Error(res.data.error_msg)
      }
      trans_result = res.data.trans_result
    }
    return trans_result as unknown as TransResult
  }

  async run() {
    this.readLanguagesConfig() // 读取旧语言包
    this.readFile() // 扫描文件中的中文
    this.createChineseFile() // 更新中文语言包
    await this.translate() // 翻译其他语言
    logger.info('翻译完成！', 'green', true)
  }
}
