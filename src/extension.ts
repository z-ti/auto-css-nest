import * as vscode from 'vscode'
import { parseHTML } from './parser/htmlParser'
import { parseVueTemplate } from './parser/vueParser'
import { generateSassNesting, hasClassAttributes } from './utils/astUtils'
import { SassPreviewPanel } from './utils/webView'

/* 提取公共逻辑 */
async function generateSass() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('编辑器不可用!')
    return null
  }

  const selection = editor.selection
  const selectedText = editor.document.getText(selection)

  if (!hasClassAttributes(selectedText)) {
    vscode.window.showWarningMessage('选中的代码不包含可提取的class属性')
    return null
  }

  try {
    const languageId = editor.document.languageId
    const classTree =
      languageId === 'vue'
        ? parseVueTemplate(selectedText)
        : parseHTML(selectedText)
    return generateSassNesting(classTree)
  } catch (error: any) {
    vscode.window.showErrorMessage(`提取class结构失败: ${error.message}`)
    return null
  }
}
/**
 * 插件激活时调用此方法
 * @param {vscode.ExtensionContext} context
 */

function activate(context: vscode.ExtensionContext) {
  // 输出到编辑器命令
  const extractCommand = vscode.commands.registerCommand(
    'auto-css-nest.classExtractor',
    async () => {
      const sassOutput = await generateSass()
      if (!sassOutput) return

      vscode.workspace
        .openTextDocument({
          content: sassOutput,
          language: 'scss',
        })
        .then((doc) => {
          vscode.window.showTextDocument(doc)
        })
    }
  )

  // 预览在 Webview命令
  const previewCommand = vscode.commands.registerCommand(
    'auto-css-nest.previewInWebview',
    async () => {
      console.log('previewInWebview')
      const sassOutput = await generateSass()
      if (!sassOutput) return
      // 使用 Webview 面板管理类显示预览
      const editor = vscode.window.activeTextEditor
      const selection = editor.selection
      const selectedText = editor.document.getText(selection)
      SassPreviewPanel.createOrShow(context, selectedText, sassOutput);
     
  )
  context.subscriptions.push(extractCommand, previewCommand)
}

// 插件卸载时调用此方法
function deactivate() {
  console.log('卸载')
}

export { activate, deactivate }
