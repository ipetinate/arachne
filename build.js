const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    sourcemap: true,
    minify: true
  })
  .catch(() => process.exit(1))
