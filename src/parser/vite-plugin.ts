import { getConfiguration } from '../utils'
import i18n from './core'
// @ts-ignore
import { PluginOptions } from 'vite'
export function i18nAutoPlugin(): PluginOptions {
  let config = getConfiguration()
  return {
    name: 'vite-plugin-i18n-parser',
    enforce: 'pre',
    transform: function (code: string, file: string) {
      if (!/node_modules/.test(file) && /.(js|ts|tsx|jsx)$/.test(file)) {
        let res = i18n(code, {
          ...(config || {}),
          filePath: file,
          // @ts-ignore
          emitWarning: this.warn.bind(this),
          isVite: true
        })
        if (res) return res
      }

      return {
        code,
        map: null
      }
    }
  }
}
