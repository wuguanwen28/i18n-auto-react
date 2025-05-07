import fs from 'fs'
import path from 'path'
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
import _traverse from '@babel/traverse'
const traverse = getDefault(_traverse)

export const tplRegexp = /(?<!\\)\$\{([\s\S]+?)\}/g

export function getDefault(data) {
  return typeof data === 'function' ? data : data.default
}

// 获取配置文件
export const getConfiguration = () => {
  let filePath = path.resolve(process.cwd(), 'i18n.config.js')
  if (!fs.existsSync(filePath)) {
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
  if (!fs.existsSync(dir)) {
    mkdir(path.dirname(dir))
    fs.mkdirSync(dir)
  }
}

// 创建文件
export const createLanguageFile = async (
  filePath: string,
  template: string,
  data: Record<string, string> = {}
) => {
  mkdir(path.dirname(filePath))
  const fileName = path.basename(filePath, path.extname(filePath))

  const file = template
    .replace('$name', `'${fileName}'`)
    .replace('$data', () => JSON.stringify(data))

  let code = await prettierJs(file)
  fs.writeFileSync(filePath, code, { encoding: 'utf-8' })
}

export async function prettierJs(code: string) {
  const filePath = await prettier.resolveConfigFile()
  const prettierConfig = (await prettier.resolveConfig(filePath!)) || {}
  return prettier.format(code, { parser: 'babel-ts', ...prettierConfig })
}

// 获取需要翻译的列表
export function scanFile(
  dirPath: string,
  config: _I18nConfigs,
  fn: (path: string) => void
) {
  const dirOrFiles = fs.readdirSync(dirPath, { encoding: 'utf8' })
  let fileRegex = config.test
  if (typeof fileRegex === 'string') fileRegex = new RegExp(fileRegex)
  const ig = ignore().add(config.exclude)
  const includes = ignore().add(config.include)
  for (let item of dirOrFiles) {
    const relativePath = path.relative(
      config.__rootPath,
      path.resolve(dirPath, item)
    )
    if (!ig.ignores(relativePath) || includes.ignores(relativePath)) {
      const filePath = path.resolve(dirPath, item)
      if (fs.lstatSync(filePath).isFile()) {
        if (fileRegex.test(item)) fn(filePath)
      } else {
        scanFile(filePath, config, fn)
      }
    }
  }
}

export function babelParse(code: string) {
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

export function readLanguages(
  name: string,
  config: _I18nConfigs,
  isExit = false
) {
  const { output } = config
  const { dir: outputPath, ext = 'js' } = output
  let curFilePath = path.resolve(
    config.__rootPath,
    outputPath,
    `${name}.${ext}`
  )
  if (!fs.existsSync(curFilePath) && isExit) {
    logger.error(`${curFilePath} 文件不存在!`)
    // process.exit(0)
  }
  const file = fs.readFileSync(curFilePath, { encoding: 'utf-8' })
  const ast = parse(file, {
    sourceType: 'module',
    plugins: ['typescript']
  })
  const res = {}
  traverse(ast, {
    ObjectProperty(path: any) {
      const key = path.node.key.value || path.node.key.name
      const value = path.node.value.value || path.node.value.name
      res[key] = value || ''
    }
  })
  return res
}

export { logger, DisableRule }
