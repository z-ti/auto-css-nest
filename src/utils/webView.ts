import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

class SassPreviewPanel {
  public static currentPanel: SassPreviewPanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private _context: vscode.ExtensionContext
  private _disposables: vscode.Disposable[] = []

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    private domText: string,
    private sassContent: string
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

  private handleWebviewMessage(message: any) {
    console.log(message, '接收到react中传过来的参数')
    switch (message.command) {
      case 'getParams':
        // 当 Webview 请求参数时发送数据
        this.sendParameters()
        return
    }
  }

  private sendParameters() {
    this._panel.webview.postMessage({
      command: 'setParams',
      params: {
        domContent: this.domText,
        sassContent: this.sassContent,
      },
    })
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
    sassContent: string
  ) {
    const column =
      vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.Beside

    if (SassPreviewPanel.currentPanel) {
      SassPreviewPanel.currentPanel._panel.reveal(column)
      SassPreviewPanel.currentPanel.update(domText, sassContent)
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
      sassContent
    )
  }

  public update(domText: string, sassContent: string) {
    this.domText = domText
    this.sassContent = sassContent
    this._panel.webview.html = this._getWebviewContent()
    this.sendParameters()
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
