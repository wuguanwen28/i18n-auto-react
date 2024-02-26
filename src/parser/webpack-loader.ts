//@ts-nocheck
import i18n from './core'

export default function (source) {
  var resourcePath = this.resourcePath
  const options = this.getOptions() || {}
  var res = source
  if (!/node_modules/.test(resourcePath)) {
    res = i18n(source, {
      ...options,
      filePath: resourcePath,
      emitWarning: this.emitWarning
    })
  }
  return res
}
