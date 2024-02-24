export { I18nCommand } from './commands'
export type { I18nConfigs } from './type'
import vitePlugin from './parser/vite-plugin'
export const loader = require.resolve('./webpack-loader')
export const i18nAutoPlugin = vitePlugin
