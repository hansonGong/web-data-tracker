import path from 'path'
import resolve from 'rollup-plugin-node-resolve' // 依赖引用插件
import commonjs from 'rollup-plugin-commonjs' // commonjs模块转换插件
import babel from 'rollup-plugin-babel'
import { eslint } from 'rollup-plugin-eslint' // eslint插件
import ts from 'rollup-plugin-typescript2'
// import { terser } from "rollup-plugin-terser"
const getPath = _path => path.resolve(__dirname, _path)
import packageJSON from './package.json'

const extensions = [
  '.js',
  '.ts'
]

// ts
const tsPlugin = ts({
  tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
  extensions
})

// eslint
const esPlugin = eslint({
  throwOnError: true,
  include: ['packages/**/*.ts'],
  exclude: ['node_modules/**', 'lib/**']
})

// 基础配置
const commonConf = {
  input: getPath('./packages/index.ts'),
  plugins:[
    resolve(extensions),
    babel({
      exclude: '**/node_modules/**'
    }),
    commonjs(),
    esPlugin,
    tsPlugin,
    // terser()
  ]
}
// 需要导出的模块类型
const outputMap = [
  {
    file: packageJSON.main, // 通用模块
    format: 'umd',
  }
]

const buildConf = options => Object.assign({}, commonConf, options)

export default outputMap.map(output => buildConf({ output: { name: 'vue-track', ...output } }))