
import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, hasClassAttributes } from './utils/astUtils';

/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  
  const disposable = vscode.commands.registerCommand('auto-css-nest.classExtractor', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('编辑器不可用!');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    
    // 检查是否包含 class 属性
    if (!hasClassAttributes(selectedText)) {
      vscode.window.showWarningMessage('选中的代码不包含可提取的class属性');
      return;
    }

    try {
      // 根据文件类型选择合适的解析器
      const languageId = editor.document.languageId;
      console.log('languageId::', languageId); // vue, react ...
      const classTree = languageId === 'vue' 
        ? parseVueTemplate(selectedText) 
        : parseHTML(selectedText);
      console.log('结构::', classTree);
      // 生成 Sass 嵌套结构
      const sassOutput = generateSassNesting(classTree);
      
      // 创建新文档显示结果
      vscode.workspace.openTextDocument({
        content: sassOutput,
        language: 'scss'
      }).then(doc => {
        vscode.window.showTextDocument(doc);
      });
      
      vscode.window.showInformationMessage('class 提取成功!');
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

// 插件卸载时调用此方法
function deactivate() { 
  console.log('卸载');
}

export { activate, deactivate };