
import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, generateBemShorthandSass, generateClassStructure, generateHierarchicalCss, hasClassAttributes } from './utils/astUtils';

/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  // 生成 Sass 结构
  const sassExtractor = vscode.commands.registerCommand('auto-css-nest.sassExtractor', function () {
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
      const { bem } = vscode.workspace.getConfiguration('nest')
      console.log('bem::', bem)
      // 生成 Sass 嵌套结构
      let generateFn = bem ? generateBemShorthandSass : generateSassNesting;
      let output = generateFn(classTree);
      
      // 创建新文档显示结果
      vscode.workspace.openTextDocument({
        content: output,
        language: 'scss'
      }).then(doc => {
        vscode.window.showTextDocument(doc);
      });
      
      vscode.window.showInformationMessage('class 提取成功!');
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });
  // 生成 CSS 结构
  const cssExtractor = vscode.commands.registerCommand('auto-css-nest.cssExtractor', function () {
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
      const classTree = languageId === 'vue' 
        ? parseVueTemplate(selectedText) 
        : parseHTML(selectedText);
      const formatOptions: vscode.QuickPickItem[] = [
        { label: 'CSS (层级结构)', description: '生成带父子层级关系的CSS' },
        { label: 'CSS (平铺结构)', description: '生成单一的CSS结构' },
      ];
      vscode.window.showQuickPick(formatOptions, {
        placeHolder: '请选择输出格式'
      }).then(selected => {
        if (!selected) return vscode.window.showWarningMessage('未选择输出格式');
        // 生成 CSS
        let cssOutput = '';
        if (selected.label === 'CSS (层级结构)') {
          cssOutput = generateHierarchicalCss(classTree);
        } else {
          cssOutput = generateClassStructure(classTree);
        }
        
        // 创建新文档显示结果
        vscode.workspace.openTextDocument({
          content: cssOutput,
          language: 'css'
        }).then(doc => {
          vscode.window.showTextDocument(doc);
        });
        
        vscode.window.showInformationMessage('class 提取成功!');
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });

  context.subscriptions.push(sassExtractor);
  context.subscriptions.push(cssExtractor);
}

// 插件卸载时调用此方法
function deactivate() { 
  console.log('卸载');
}

export { activate, deactivate };