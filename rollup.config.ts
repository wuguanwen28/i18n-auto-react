import { RollupOptions } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import path from 'path'

const mainConfig: RollupOptions[] = [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.mjs',
      format: 'esm'
    },
    plugins: [typescript()]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  }
]

const config: RollupOptions[] = [
  {
    input: {
      commands: './src/commands/index.ts',
      'vite-plugin': './src/parser/vite-plugin.ts',
      'webpack-loader': './src/parser/webpack-loader.ts'
    },
    output: {
      dir: 'dist',
      format: 'cjs',
      chunkFileNames: '[name].js',
      entryFileNames: '[name]/index.js',
      hoistTransitiveImports: false,
      manualChunks: (id) => {
        if (id.includes('utils')) {
          const fileName = path.basename(id, path.extname(id))
          return `utils/${fileName}`
        }
        if (id.includes('commands')) {
          const fileName = path.basename(id, path.extname(id))
          return `commands/${fileName}`
        }
        if (id.includes('core')) return 'utils/parser'
      }
    },
    plugins: [typescript()]
  },
  {
    input: {
      'vite-plugin': './src/parser/vite-plugin.ts',
      'webpack-loader': './src/parser/webpack-loader.ts'
    },
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name]/index.d.ts'
    },
    plugins: [dts()]
  },
  ...mainConfig
]

export default config
