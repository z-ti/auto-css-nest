
import * as vscode from 'vscode';
import { parseHTML } from './parser/htmlParser';
import { parseVueTemplate } from './parser/vueParser';
import { generateSassNesting, generateBemShorthandSass, generateStylusNesting, generateClassStructure, generateHierarchicalCss } from './utils/astUtils';
import { message, quickPick, installCommands, hasClassAttributes, detectCodeType, injectStylesToVue } from './utils/shared'
import { STYLE_LANG_TYPES, CLIPBOARD_TYPES } from './utils/constants';

// 样式提取并处理
const extractorFn = async (styleLang: typeof STYLE_LANG_TYPES[number]) => {
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
    const languageId = document.languageId;
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

// 剪切板转换
const clipboardFn = async (mode: typeof CLIPBOARD_TYPES[number]) => {
  try {
    // ctrl+shift+c 从选中的代码中提取class，并转换之后写入剪切板，用户自行ctrl+v粘贴
    // ctrl+shift+v 从用户copy的剪切板中拿代码提取class，并转换之后自动粘贴
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return message.error('编辑器不可用!');
    }
    const selection = editor.selection;
    const document = editor.document;
    let selectedText = ''
    let languageId = '';
    if (mode === 'copy') {
      languageId = document.languageId;
      selectedText = document.getText(selection);
    } else if(mode === 'paste') {
      selectedText = await vscode.env.clipboard.readText();
      if (!selectedText.trim()) {
        return message.warning('剪贴板内容为空!');
      }
      languageId = detectCodeType(selectedText);
      if (languageId === 'unknown') {
        return message.warning('无法识别剪贴板中的代码类型!');
      }
    }
    if (!hasClassAttributes(selectedText)) {
      return message.warning('选中的代码不包含可提取的class属性');
    }
    // 根据文件类型选择合适的解析器
    const classTree = languageId === 'vue' 
      ? parseVueTemplate(selectedText) 
      : parseHTML(selectedText);
    const { clipboardFormat‌ } = vscode.workspace.getConfiguration('nest');
    // 生成 嵌套结构
    let generateFn;
    switch (clipboardFormat‌) {
      case 'Sass':
      case 'Less':
        generateFn = generateSassNesting;
        break;
      
      case 'Sass &':
      case 'Less &':
        generateFn = generateBemShorthandSass;
        break;
      
      case 'Stylus':
        generateFn = generateStylusNesting;
        break;
      
      case 'CSS with Parent-Child':
        generateFn = generateHierarchicalCss;
        break;
      
      case 'CSS with Single Layer':
        generateFn = generateClassStructure;
        break;
    
      default:
        generateFn = generateSassNesting;
        break;
    }
    let output = generateFn(classTree);
    if (mode === 'copy') {
      await vscode.env.clipboard.writeText(output);
      message.success('class结构已写入剪切板，请在指定的位置ctrl+v粘贴')
    }else if (mode === 'paste') {
      const { activeTextEditor } = vscode.window;
      activeTextEditor?.edit(editBuilder => { 
        // const position = editor.selection.active;
        // editBuilder.insert(position, output);
        const { character, line } = activeTextEditor.selection.active;
        editBuilder.replace(activeTextEditor.selection,  output.replace(/\n/g, `\n${' '.repeat(character)}`));
      });
      message.success('已自动粘贴生成的class结构!');
    }
  } catch (error: any) {
    message.error(`注入class结构失败: ${error.message}`);
  }
}

/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */
function activate(context: vscode.ExtensionContext) {
  const commands = installCommands(STYLE_LANG_TYPES, extractorFn).concat(installCommands(CLIPBOARD_TYPES, clipboardFn));
  [].push.apply(context.subscriptions, commands);
}

// 插件卸载时调用此方法
function deactivate() { 
  console.log('卸载');
}

export { activate, deactivate };