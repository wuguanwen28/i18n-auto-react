import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  writeFileSync
} from 'fs'
import { basename, dirname, extname, relative, resolve } from 'path'
import { logger } from './log'
import ignore from 'ignore'
import prettier from 'prettier'
import { _I18nConfigs } from '../commands/Translate'
import { parse } from '@babel/parser'
import { ImportInfo } from '../type'
import t from '@babel/types'
import crypto from 'crypto'
import { DisableRule } from './disableRule'
export * from './tpl'

// 获取配置文件
export const getConfiguration = () => {
  let filePath = resolve(process.cwd(), 'i18n.config.js')
  if (!existsSync(filePath)) {
    logger.error(`配置文件不存在，请执行 npx i18n init`)
    process.exit(0)
  }
  let config = require(filePath)
  config.__rootPath = process.cwd()
  config.include = Array.isArray(config.include)
    ? config.include
    : [config.include]
  config.exclude = Array.isArray(config.exclude)
    ? config.exclude
    : [config.exclude]
  return config
}

// 创建文件夹
export const mkdir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdir(dirname(dir))
    mkdirSync(dir)
  }
}

// 创建文件
export const createLanguageFile = async (
  filePath: string,
  template: string,
  data: Record<string, string> = {}
) => {
  mkdir(dirname(filePath))
  const fileName = basename(filePath, extname(filePath))

  const file = template
    .replace('$name', `'${fileName}'`)
    .replace('$data', () => JSON.stringify(data))

  let code = await prettierJs(file)
  writeFileSync(filePath, code, { encoding: 'utf-8' })
}

export function prettierJs(code: string, config = {}) {
  const defaultConfig = {
    parser: 'babel-ts',
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    semi: false,
    trailingComma: 'none',
    bracketSpacing: true,
    quoteProps: 'consistent',
    arrowParens: 'avoid',
    jsxBracketSameLine: false,
    overrides: [
      {
        files: ['*.js'],
        options: {
          spaceBeforeFunctionParen: true
        }
      }
    ]
  }
  return prettier.format(code, Object.assign(defaultConfig, config) as any)
}

// 获取需要翻译的列表
export function scanFile(
  dirPath: string,
  config: _I18nConfigs,
  fn: (path: string) => void
) {
  const dirOrFiles = readdirSync(dirPath, { encoding: 'utf8' })
  let fileRegex = config.test
  if (typeof fileRegex === 'string') fileRegex = new RegExp(fileRegex)
  const ig = ignore().add(config.exclude)
  const includes = ignore().add(config.include)
  for (let item of dirOrFiles) {
    const relativePath = relative(config.__rootPath, resolve(dirPath, item))
    if (!ig.ignores(relativePath) || includes.ignores(relativePath)) {
      const filePath = resolve(dirPath, item)
      if (lstatSync(filePath).isFile()) {
        if (fileRegex.test(item)) fn(filePath)
      } else {
        scanFile(filePath, config, fn)
      }
    }
  }
}

export function babelParse(code: string, file: string) {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      errorRecovery: true,
      plugins: ['jsx', 'typescript', 'decorators-legacy'].filter(
        (n) => n
      ) as any[]
    })
    if (ast.errors.length > 0) {
      ast.errors.forEach((err) => logger.error(err as unknown as Error))
      return
    }
    return ast
  } catch (error: any) {
    logger.error(error)
  }
}

export function isCallExpression(path: any, importInfo: ImportInfo) {
  let { imported, local } = importInfo
  if (t.isCallExpression(path.parent)) {
    let name = path.parent.callee.name
    if (name === imported || local === name) return true
  }
  return false
}

export function md5Hash(str: string, secretKey?: string): string {
  let md5
  if (secretKey) {
    md5 = crypto.createHmac('md5', secretKey)
  } else {
    md5 = crypto.createHash('md5')
  }
  return md5.update(str).digest('hex') as string
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { logger, DisableRule }
