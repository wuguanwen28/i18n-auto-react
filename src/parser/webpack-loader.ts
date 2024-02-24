import i18n from './core'

export default function (source) {
  // @ts-ignore
  let that = this
  var resourcePath = that.resourcePath
  const options = that.getOptions() || {}
  var res = source
  if (!/node_modules/.test(resourcePath)) {
    res = i18n(source, {
      ...options,
      filePath: resourcePath,
      emitWarning: that.emitWarning
    })
  }
  return res
}
