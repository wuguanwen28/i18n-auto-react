import { getConfiguration } from '../utils'
import i18n from './core'

export default function (): any {
  let config = getConfiguration()
  return {
    name: 'vite-plugin-i18n-parser',
    enforce: 'pre',
    transform: function (code: string, file: string) {
      let res = code
      if (!/node_modules/.test(file) && /.(js|ts|tsx|jsx)$/.test(file)) {
        res = i18n(code, {
          ...(config || {}),
          filePath: file,
          // @ts-ignore
          emitWarning: this.warn.bind(this),
          isVite: true
        })
      }

      return {
        code: res,
        map: null
      }
    }
  }
}
