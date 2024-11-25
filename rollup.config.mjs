import path from 'path'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    json(),
    commonjs(),
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
    }),
    resolve({
      preferBuiltins: true
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true
    })
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    warn(warning)
  }
}
