
import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, generateBemShorthandSass, generateStylusNesting, generateClassStructure, generateHierarchicalCss } from './utils/astUtils';
import { message, quickPick, installCommands, hasClassAttributes, injectStylesToVue } from './utils/shared'
import { STYLE_LANG_TYPES } from './utils/constants';

// 样式提取并处理
const extractorFn = async (styleLang: string) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return message.error('编辑器不可用!');
  }

  const selection = editor.selection;
  const document = editor.document;
  const selectedText = document.getText(selection);
  
  // 检查是否包含 class 属性
  if (!hasClassAttributes(selectedText)) {
    return message.warning('选中的代码不包含可提取的class属性');
  }

  try {
    // 根据文件类型选择合适的解析器
    const languageId = editor.document.languageId;
    const classTree = languageId === 'vue' 
      ? parseVueTemplate(selectedText) 
      : parseHTML(selectedText);
    const { bem, insertBottom } = vscode.workspace.getConfiguration('nest');
    // 生成 嵌套结构
    let generateFn;
    if (['sass', 'less'].includes(styleLang)) {
      generateFn = bem ? generateBemShorthandSass : generateSassNesting;
    } else if (styleLang === 'css') {
      const formatOptions: vscode.QuickPickItem[] = [
        { label: 'CSS (层级结构)', description: '生成带父子层级关系的CSS' },
        { label: 'CSS (平铺结构)', description: '生成单一的CSS结构' },
      ];
      const selected: vscode.QuickPickItem = await quickPick(formatOptions);
      if (!selected) return message.warning('未选择输出格式');
      generateFn = selected.label === 'CSS (层级结构)' ? generateHierarchicalCss : generateClassStructure;
    } else if (styleLang === 'stylus') {
      generateFn = generateStylusNesting;
    }
    let output = generateFn(classTree);
    if (insertBottom) {
      if (languageId === 'vue') {
        // 生成的代码注入到Vue文件底部
        await injectStylesToVue(document, output, editor, styleLang);
        message.success('生成的代码 已注入到 Vue 文件');
      } else {
        message.error(`自动注入到文件末端功能仅限vue文件`);
      }
    } else {
      const langMap = {
        'sass': 'scss',
        'less': 'less',
        'stylus': 'stylus',
        'css': 'css'
      };
      // 创建新文档显示结果
      vscode.workspace.openTextDocument({
        content: output,
        language: langMap[styleLang]
      }).then(doc => {
        vscode.window.showTextDocument(doc);
      });
      message.success('class 提取成功!');
    } 
  } catch (error: any) {
    message.error(`提取class结构失败: ${error.message}`);
  }
}

/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  const commands = installCommands(STYLE_LANG_TYPES, extractorFn);
  [].push.apply(context.subscriptions, commands);
}

// 插件卸载时调用此方法
function deactivate() { 
  console.log('卸载');
}

export { activate, deactivate };