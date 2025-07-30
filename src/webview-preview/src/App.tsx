import { useState, useEffect } from 'react'
import './App.css'

import type { RadioChangeEvent } from 'antd'
import { Row, Button, Col, Radio, Typography } from 'antd'

declare const acquireVsCodeApi: () => {
  postMessage(message: any): void
  getState(): any
  setState(state: any): void
}
const vscode = acquireVsCodeApi()

function App() {
  const { Title } = Typography
  const [cssType, setValue] = useState(1)
  const onCssTypeChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value)
    setValue(e.target.value)
    vscode.postMessage({
      command: 'getParams',
      cssType,
    })
  }

  const [sassContent, setSassPreContent] = useState<string | null>(null)
  const [domContent, setDomPreContent] = useState<string | null>(null)

  useEffect(() => {
    //首次默认向插件发送一次消息获取dom和生成sass
    vscode.postMessage({
      command: 'getParams',
      cssType,
    })

    window.addEventListener('message', (event) => {
      const message = event.data
      switch (message.command) {
        case 'setParams':
          setSassPreContent(message.params.sassContent)
          setDomPreContent(message.params.domContent)
          break
      }
    })
  }, [])

  return (
    <>
      <div className="container">
        <Row>
          <Col span={11}>
            <Title level={4}>选中的DOM</Title>
            <div className="container-border">
              <pre>
                <code> {domContent}</code>
              </pre>
            </div>
          </Col>
          <Col span={2} className="trans-button">
            <Button type="primary">转换</Button>
          </Col>
          <Col span={11}>
            <Title level={4}>生成的css</Title>
            <div className="container-border">
              {/* ['sass', 'less', 'stylus', 'css'] */}
              <Radio.Group onChange={onCssTypeChange} value={cssType}>
                <Radio value={'less'}>&-xxx连接符</Radio>
                <Radio value={'css'}>class非嵌套结构</Radio>
                <Radio value={'sass'}>sass嵌套结构</Radio>
                <Radio value={'stylus'}>stylus结构</Radio>
              </Radio.Group>
              <pre>
                <code> {sassContent}</code>
              </pre>
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default App
