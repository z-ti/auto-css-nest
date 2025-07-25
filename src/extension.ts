
import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, generateBemShorthandSass, generateStylusNesting, generateClassStructure, generateHierarchicalCss } from './utils/astUtils';
import { hasClassAttributes, injectStylesToVue } from './utils/shared'

/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  // 生成 Sass 结构
  const sassExtractor = vscode.commands.registerCommand('auto-css-nest.sassExtractor', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('编辑器不可用!');
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
    const selectedText = document.getText(selection);
    
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
      const { bem, insertBottom } = vscode.workspace.getConfiguration('nest')
      console.log('bem::', bem)
      // 生成 Sass 嵌套结构
      let generateFn = bem ? generateBemShorthandSass : generateSassNesting;
      let output = generateFn(classTree);
      if (insertBottom) {
        if (languageId === 'vue') {
          // 生成的代码注入到Vue文件底部
          await injectStylesToVue(document, output, editor, 'scss');
          vscode.window.showInformationMessage('生成的代码 已注入到 Vue 文件');
        } else {
          vscode.window.showErrorMessage(`自动注入到文件末端功能仅限vue文件`);
        }
      } else {
        // 创建新文档显示结果
        vscode.workspace.openTextDocument({
          content: output,
          language: 'scss'
        }).then(doc => {
          vscode.window.showTextDocument(doc);
        });
        vscode.window.showInformationMessage('class 提取成功!');
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });
  // 生成 Less 结构
  const lessExtractor = vscode.commands.registerCommand('auto-css-nest.lessExtractor', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('编辑器不可用!');
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
    const selectedText = document.getText(selection);
    
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
      const { bem, insertBottom } = vscode.workspace.getConfiguration('nest')
      console.log('bem::', bem)
      // 生成 Less 嵌套结构
      let generateFn = bem ? generateBemShorthandSass : generateSassNesting;
      let output = generateFn(classTree);
      if (insertBottom) {
        if (languageId === 'vue') {
          // 生成的代码注入到Vue文件底部
          await injectStylesToVue(document, output, editor, 'less');
          vscode.window.showInformationMessage('生成的代码 已注入到 Vue 文件');
        } else {
          vscode.window.showErrorMessage(`自动注入到文件末端功能仅限vue文件`);
        }
      } else {
        // 创建新文档显示结果
        vscode.workspace.openTextDocument({
          content: output,
          language: 'less'
        }).then(doc => {
          vscode.window.showTextDocument(doc);
        });
        vscode.window.showInformationMessage('class 提取成功!');
      }
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
    const document = editor.document;
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
      }).then(async selected => {
        if (!selected) return vscode.window.showWarningMessage('未选择输出格式');
        // 生成 CSS
        let cssOutput = '';
        if (selected.label === 'CSS (层级结构)') {
          cssOutput = generateHierarchicalCss(classTree);
        } else {
          cssOutput = generateClassStructure(classTree);
        }
        
        const { insertBottom } = vscode.workspace.getConfiguration('nest')
        if (insertBottom) {
          if (languageId === 'vue') {
            // 生成的代码注入到Vue文件底部
            await injectStylesToVue(document, cssOutput, editor, 'css');
            vscode.window.showInformationMessage('生成的代码 已注入到 Vue 文件');
          } else {
            vscode.window.showErrorMessage(`自动注入到文件末端功能仅限vue文件`);
          }
        } else {
          // 创建新文档显示结果
          vscode.workspace.openTextDocument({
            content: cssOutput,
            language: 'css'
          }).then(doc => {
            vscode.window.showTextDocument(doc);
          });
          vscode.window.showInformationMessage('class 提取成功!');
        }
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });
  // 生成 Stylus 结构
  const stylusExtractor = vscode.commands.registerCommand('auto-css-nest.stylusExtractor', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('编辑器不可用!');
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
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
      // 生成 Stylus 嵌套结构
      let output = generateStylusNesting(classTree);
      
      const { insertBottom } = vscode.workspace.getConfiguration('nest')
        if (insertBottom) {
          if (languageId === 'vue') {
            // 生成的代码注入到Vue文件底部
            await injectStylesToVue(document, output, editor, 'stylus');
            vscode.window.showInformationMessage('生成的代码 已注入到 Vue 文件');
          } else {
            vscode.window.showErrorMessage(`自动注入到文件末端功能仅限vue文件`);
          }
        } else {
          // 创建新文档显示结果
          vscode.workspace.openTextDocument({
            content: output,
            language: 'stylus'
          }).then(doc => {
            vscode.window.showTextDocument(doc);
          });
          vscode.window.showInformationMessage('class 提取成功!');
        }
    } catch (error: any) {
      vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`);
    }
  });

  // context.subscriptions.push(sassExtractor);
  [].push.apply(context.subscriptions, [sassExtractor, cssExtractor, stylusExtractor, lessExtractor]);
}

// 插件卸载时调用此方法
function deactivate() { 
  console.log('卸载');
}

export { activate, deactivate };