import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

import { parseHTML } from './../parser/htmlParser';
import { parseVueTemplate } from './../parser/vueParser';
import { parseJSX } from './../parser/reactParser';
import { generateSassNesting, generateBemShorthandSass, generateStylusNesting, generateClassStructure, generateHierarchicalCss } from './../utils/astUtils';
import { message, quickPick } from './../utils/shared'
class SassPreviewPanel {
  public static currentPanel: SassPreviewPanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private _context: vscode.ExtensionContext
  private _disposables: vscode.Disposable[] = []

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    private domText: string,
    private languageId: string
  ) {
    this._panel = panel
    this._context = context
    this._panel.webview.html = this._getWebviewContent()
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // 监听来自 Webview 的消息
    this._panel.webview.onDidReceiveMessage(
      (message) => this.handleWebviewMessage(message),
      null,
      this._disposables
    )
  }

  private async getSassContent(styleLang) { 
    const languageId = this.languageId;
    const parseFnMap = {
      'htm': parseHTML,
      'html': parseHTML,
      'vue': parseVueTemplate,
      'javascript': parseJSX,
      'javascriptreact': parseJSX,
      'typescriptreact': parseJSX
    };
    const parseFn = parseFnMap[languageId] || parseHTML;
    const classTree = parseFn(this.domText);
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
    return output
  }

  private handleWebviewMessage(message: any) {
    console.log(message, '接收到react中传过来的参数')
    this.sendParameters(message)
  }

  private async sendParameters(message:any) {
    switch (message.command) {
      case 'getDomContent':
        this._panel.webview.postMessage({
          command: 'setDomContent',
          params: {
            domContent: this.domText
          },
        })
        return
      case 'getSassContent':
        const output = await this.getSassContent(message.cssType)
        // 当 Webview 请求参数时发送数据
        this._panel.webview.postMessage({
          command: 'setSassContent',
          params: {
            sassContent: output
          },
        })
        return
    }
  }

  private _getWebviewContent(): string {
    // 读取本地HTML文件内容
    const htmlPath = path.join(
      this._context.extensionPath,
      'src',
      'webview-preview/dist/',
      'index.html'
    )

    let htmlContent = ''
    try {
      htmlContent = fs.readFileSync(htmlPath, 'utf8')
    } catch (error) {
      vscode.window.showErrorMessage(`无法加载 Webview 模板: ${error}`)
      return `<html><body><h1>Error loading template</h1></body></html>`
    }

    // 转换资源路径
    htmlContent = this.transformResourcePaths(htmlContent)

    return htmlContent
  }

  private transformResourcePaths(htmlContent: string): string {
    const webview = this._panel.webview
    console.log(htmlContent, 'htmlContent')
    // 替换资源路径为Webview可访问的URI
    return htmlContent.replace(
      /(href|src)="([^"]*)"/g,
      (match, attr, resourcePath) => {
        const fullPath = vscode.Uri.file(
          path.join(
            this._context.extensionPath,
            'src',
            'webview-preview/dist/',
            resourcePath
          )
        )
        console.log(fullPath, 'fullPath')
        //asWebviewUri() 方法将本地文件路径转换为 Webview 可访问的特殊 URI
        const webviewUri = webview.asWebviewUri(fullPath)
        //替换原始路径
        return `${attr}="${webviewUri}"`
      }
    )
  }

  public static createOrShow(
    context: vscode.ExtensionContext,
    domText: string,
    languageId: string
  ) {
    const column =
      vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.Beside

    if (SassPreviewPanel.currentPanel) {
      SassPreviewPanel.currentPanel._panel.reveal(column)
      SassPreviewPanel.currentPanel.update(domText, languageId)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      'sassPreview',
      'Sass Preview',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(context.extensionPath, 'src', 'webview-preview/dist/')
          ),
        ],
      }
    )
    SassPreviewPanel.currentPanel = new SassPreviewPanel(
      panel,
      context,
      domText,
      languageId
    )
  }

  public update(domText: string, languageId:string) {
    this.domText = domText
    this.languageId = languageId
    this._panel.webview.html = this._getWebviewContent()
  }

  public dispose() {
    SassPreviewPanel.currentPanel = undefined
    this._panel.dispose()
    while (this._disposables.length) {
      const disposable = this._disposables.pop()
      if (disposable) disposable.dispose()
    }
  }
}

export { SassPreviewPanel }
