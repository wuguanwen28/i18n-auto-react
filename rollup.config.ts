import { RollupOptions } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const config: RollupOptions[] = [
  {
    input: {
      index: './src/index.ts'
    },
    output: {
      dir: 'dist',
      format: 'cjs',
      chunkFileNames: '[name].js',
      manualChunks: (id) => {
        if (id.includes('utils')) return 'utils'
        if (id.includes('commands')) return 'commands'
      },
      hoistTransitiveImports: false
    },
    plugins: [typescript()]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'cjs'
    },
    plugins: [dts()]
  }
]

export default config
