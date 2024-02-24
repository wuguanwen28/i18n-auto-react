export type ImportInfo = {
  /**
   * 引入源
   */
  source: string
  /**
   * 引入函数名称
   */
  imported: string
  /**
   * 函数别名，默认为 _${imported}
   */
  local: string
}

export interface I18nConfigs {
  /**
   * 入口文件夹路径
   */
  entry: string | string[]
  /**
   * 出口路径
   */
  output: {
    /**
     * 出口文件夹名称
     */
    dir: string
    /**
     * 文件扩展名
     */
    ext: 'js' | 'ts'
  }
  /**
   * 查找文件规则
   */
  test: RegExp | string
  /**
   * 包含的文件或文件夹，优先级高于exclude
   */
  include: string | Array<string>
  /**
   * 排除的文件夹或文件
   */
  exclude: string | Array<string>
  /**
   * 要翻译的语种, 支持语种：https://api.fanyi.baidu.com/doc/21
   */
  languages: ['zh', 'en']
  /**
   * 导入翻译工具库
   */
  importInfo: ImportInfo
  /**
   * 导出语言包模板
   * $data为语言包对象
   * $name为语言名称
   * @example 'export default $data'
   */
  template: string
  /**
   * 百度翻译开放平台服务
   */
  server: {
    /**
     * appId
     */
    appId: string
    /**
     * 密钥
     */
    key: string
    /**
     * qps
     */
    qps: number
  }
}
