import * as vscode from 'vscode';

export function hasClassAttributes(code: string): boolean {
  return /(^|\s)(class|:class|v-bind:class)\s*=/.test(code);
}

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