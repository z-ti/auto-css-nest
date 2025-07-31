import * as vscode from 'vscode';
import { BASE_COMMAND } from './constants';
import { CommandType, CodeType } from '../types/common';

const global = vscode.window;

export function hasClassAttributes(code: string): boolean {
  return /(^|\s)(class|:class|v-bind:class|className)\s*=/.test(code);
}

export const message = (() => {
  const msgMap: Record<string, string> = {
    success: 'showInformationMessage',
    info: 'showInformationMessage',
    error: 'showErrorMessage',
    warning: 'showWarningMessage'
  };
  let msg = Object.create(null);
  for (const key in msgMap) {
    // @ts-ignore
    msg[key] = (...args) => global[msgMap[key]](...args);
  }
  return msg;
})();

export const quickPick = (options: vscode.QuickPickItem[]): Promise<vscode.QuickPickItem> => {
  return new Promise((resolve, reject) => {
    global
      .showQuickPick(options)
      .then((res) => {
        resolve(res);
      }) // @ts-ignore
      .catch(reject);
  });
};

export const installCommands = (types: readonly CommandType[], method: Function) => {
  return types.map((type: CommandType) => {
    const command = `${BASE_COMMAND}.${type}Extractor`;
    return vscode.commands.registerCommand(command, () => {
      method.call(null, type);
    });
  });
};

export async function injectStylesToVue(document: vscode.TextDocument, styleCode: string, editor: vscode.TextEditor, insertStyleLang = 'scss') {
  const fullText = document.getText();
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;

  // 查找最后一个<style>标签
  let lastStyleEnd = 0;
  let match;

  while (match = styleTagRegex.exec(fullText)) {
    lastStyleEnd = match.index + match[0].length;
    // insertStyleLang = match[1].includes('lang="scss"') ? 'scss' : 'css';
  }
  const { vueStyleScoped } = vscode.workspace.getConfiguration('nest')
  const scopedAttr = vueStyleScoped ? ' scoped' : '';
  const langAttr = insertStyleLang !== 'css' ? ` lang="${insertStyleLang}"` : '';
  const styleTag = `<style${langAttr}${scopedAttr}>\n${styleCode}</style>`;

  await editor.edit(editBuilder => {
    if (lastStyleEnd > 0) {
      // 在最后一个</style>后插入新样式
      const position = document.positionAt(lastStyleEnd);
      editBuilder.insert(position, `\n\n${styleTag}`);
    } else {
      // 文件末尾添加新样式标签
      const lastLine = document.lineAt(document.lineCount - 1);
      const position = new vscode.Position(document.lineCount, lastLine.text.length);
      editBuilder.insert(position, `\n\n${styleTag}`);
    }
  });
}

// 检测代码片段类型
export function detectCodeType(code: string): CodeType {

  // 1. 检查 Vue 特征
  const vueFeatures = [
    /v-[a-z-]+/,          // Vue 指令 (v-if, v-for)
    /@[a-z]+/,             // Vue 事件简写 (@click)
    /:([a-z]+|\.)/,        // Vue 绑定简写 (:class, :.sync)
    /{{\s*[^{}]*\s*}}/,   // Vue 插值语法
    /<script\s+lang=["']ts["']/, // Vue SFC <script> 块
    /<style\s+scoped/,     // Vue 作用域样式
    /<template>/,          // Vue 模板标签
  ];

  if (vueFeatures.some(regex => regex.test(code))) {
    return 'vue';
  }

  // 2. 检查 React 特征
  const reactFeatures = [
    /className=/,          // React 类名属性
    /{\s*[\w$]+\s*}/,     // JSX 表达式插值（单花括号）
    /import\s+React/,      // 导入 React
    /React\.createElement/,// React 创建元素
    /<[a-z]+>\s*{/,        // JSX 元素中包含表达式
    /\.tsx/,               // TSX 文件扩展名
  ];

  if (reactFeatures.some(regex => regex.test(code))) {
    return 'react';
  }

  // 3. 检查 HTML 特征
  const htmlFeatures = [
    /<!DOCTYPE html>/i,    // HTML5 文档声明
    /<html[\s>]/,          // <html> 标签
    /<head[\s>]/,          // <head> 标签
    /<body[\s>]/,          // <body> 标签
    /<div[\s>]/,           // 常见 HTML 标签
    /<span[\s>]/,
    /<p[\s>]/,
    /<a[\s>]/,
    /class=/,              // HTML class 属性
  ];

  if (htmlFeatures.some(regex => regex.test(code))) {
    return 'html';
  }

  if (code.includes('</template>')) return 'vue';
  if (code.includes('</>')) return 'react';
  if (code.includes('<>')) return 'react';

  return 'unknown';
}