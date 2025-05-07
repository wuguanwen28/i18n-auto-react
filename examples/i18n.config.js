/** * @type {import('i18n-auto-react').I18nConfigs} */
const config = {
  entry: './src',
  output: {
    dir: './src/locale/',
    ext: 'ts'
  },

  test: /.*([jt]sx?)$/,
  include: [],
  exclude: ['src/locale'],

  languages: ['zh', 'en'],

  importInfo: {
    source: 'i18n-auto-react',
    imported: 'i18n',
    local: '_i18n'
  },

  template: 'export default $data',

  warning: true,

  // 请申请自己的百度翻译服务
  server: {
    appId: '20240205001959492',
    key: 'ojHf7fp2U8VwcRXWg2UP'
  }
}

module.exports = config
