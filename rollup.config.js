import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import path from 'path';
import fs from 'fs';

// 是否生产模式
const isProduction = process.env.NODE_ENV === 'production';

const dynamicPackageJson = () => ({
  name: 'dynamic-package-json',
  buildStart() {
    // 在每次构建开始时读取最新 package.json
    this.addWatchFile(path.resolve('package.json'));
  },
  generateBundle() {
    const pkgPath = path.resolve('package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.main = "./extension.js";
    delete pkg.dependencies;
    delete pkg.devDependencies;
    delete pkg.type;
    const outPath = path.join('out', 'package.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(pkg, null, 2));
  }
});

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
    // 动态生成 package.json 内容
    dynamicPackageJson(),
    // 复制 README.md 到输出目录
    copy({
      targets: [
        { src: 'README.md', dest: 'out' },
        { src: 'CHANGELOG.md', dest: 'out' },
        { src: 'LICENSE', dest: 'out' },
        { src: 'images', dest: 'out' },
        { src: '.vscodeignore', dest: 'out' },
      ]
    }),
  ],

  // 外部依赖 - 这些模块不会被打包
  external: [
    'vscode',
    'fs',
    'path'
  ],

  // 监听文件变化
  watch: {
    include: ['src/**', 'package.json'],
    exclude: 'node_modules/**'
  }
};