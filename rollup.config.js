import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    input: './node_modules/lodash.merge/index.js',
    output: {
      file: 'src/merge.js',
      format: 'iife',
      name: 'merge'
    },
    plugins: [
      commonjs()
    ]
  },
  {
    input: './node_modules/lodash.clonedeep/index.js',
    output: {
      file: 'src/clonedeep.js',
      format: 'iife',
      name: 'cloneDeep'
    },
    plugins: [
      commonjs()
    ]
  },
  {
    input: './node_modules/lodash.has/index.js',
    output: {
      file: 'src/has.js',
      format: 'iife',
      name: 'has'
    },
    plugins: [
      commonjs()
    ]
  },
  {
    input: './node_modules/KaleoJWT/src/index.js',
    output: {
      file: 'src/KaleoJWT.js',
      format: 'iife',
      name: 'jwt'
    },
    plugins: [
      commonjs()
    ]
  },
  {
    input: './node_modules/core-js/web/url.js',
    output: {
      file: 'src/url.js',
      format: 'iife',
      name: 'URL'
    },
    plugins: [
      commonjs()
    ]
  }
]
