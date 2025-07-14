import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

// 是否生产模式
const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/extension.ts', // 入口文件
  output: {
    dir: 'out', // 输出目录
    format: 'cjs', // CommonJS 格式
    sourcemap: !isProduction, // 开发环境生成 sourcemap
    exports: 'named' // 添加 exports 选项
  },
  plugins: [
    // 解析 node_modules 中的模块
    resolve({
      preferBuiltins: true,
      extensions: ['.ts', '.js']
    }),

    // 将 CommonJS 模块转换为 ES6
    commonjs(),

    // 处理 JSON 文件
    json(),

    // 编译 TypeScript
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProduction,
      inlineSources: !isProduction,
      outputToFilesystem: true
    }),

    // 生产环境下压缩代码
    isProduction && terser(),

    // 复制 package.json 到输出目录
    copy({
      targets: [
        {
          src: 'package.json',
          dest: 'out',
          transform: (content) => {
            const pkg = JSON.parse(content);
            delete pkg.type;
            return JSON.stringify(pkg, null, 2);
          }
        },
        { src: 'README.md', dest: 'out' }
      ]
    }),
  ],

  // 外部依赖 - 这些模块不会被打包
  external: [
    'vscode',
    '@vue/compiler-dom',
    'parse5',
    'htmlparser2',
    'fs',
    'path',
    'util'
  ],

  // 监听文件变化
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
};