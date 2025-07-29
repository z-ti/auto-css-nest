import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, hasClassAttributes } from './utils/astUtils';

// 添加 Webview 面板管理类


function activate(context: vscode.ExtensionContext) {
  
  // 提取公共逻辑
  async function generateSass() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('编辑器不可用!');
      return null;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    
    if (!hasClassAttributes(selectedText)) {
      vscode.window.showWarningMessage('选中的代码不包含可提取的class属性');
      return null;
    }

    try {
      const languageId = editor.document.languageId;
      const classTree = languageId === 'vue' 
        ? parseVueTemplate(selectedText) 
        : parseHTML(selectedText);
      return generateSassNesting(classTree);
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
      return null;
    }
  }

  // 原始命令：输出到编辑器
  const extractCommand = vscode.commands.registerCommand('auto-css-nest.classExtractor', async () => {
    const sassOutput = await generateSass();
    if (!sassOutput) return;
    
    vscode.workspace.openTextDocument({
      content: sassOutput,
      language: 'scss'
    }).then(doc => {
      vscode.window.showTextDocument(doc);
    });
  });

  // 新命令：预览在 Webview
  const previewCommand = vscode.commands.registerCommand('auto-css-nest.previewInWebview', async () => {
    const sassOutput = await generateSass();
    if (!sassOutput) return;
    
    SassPreviewPanel.createOrShow(sassOutput);
  });

  context.subscriptions.push(extractCommand, previewCommand);
}

function deactivate() { 
  // 清理资源
  if (SassPreviewPanel.currentPanel) {
    SassPreviewPanel.currentPanel.dispose();
  }
}