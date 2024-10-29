//@ts-nocheck
import { getConfiguration } from '../utils'
import i18n from './core'

let options = null

export default function (source, map, meta) {
  let resourcePath = this.resourcePath

  if (!/node_modules/.test(resourcePath)) {
    if (!options) options = getConfiguration() || {}
    let res = i18n(source, {
      ...options,
      filePath: resourcePath,
      emitWarning: this.emitWarning
    })

    if (res && res.code) {
      this.callback(null, res.code, map || res.map, meta)
      return
    }
  }
  this.callback(null, source, map, meta)
}
