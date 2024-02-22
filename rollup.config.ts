import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript'

const config: RollupOptions = {
  input: {
    "index": './src/index.ts',
  },
  output: {
    dir: 'dist',
    format: 'cjs',
    chunkFileNames: '[name].js',
    manualChunks: (id) => {
    }
  },
  plugins: [
    typescript()
  ]
}

export default config