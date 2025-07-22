# Auto CSS Nest

[![auto-css-next](https://img.shields.io/github/v/tag/z-ti/auto-css-nest?color=blue&label=version)](https://github.com/z-ti/auto-css-nest)
[![License: MIT](https://img.shields.io/github/license/z-ti/auto-css-nest)](https://github.com/z-ti/auto-css-nest/blob/main/LICENSE)

中文 | [English](./README.en.md)

## 功能简介

Auto CSS Nest 是一个强大的 VS Code 插件，它能自动从选定的 HTML 或 Vue 模板代码中提取 class 结构，并生成符合 Sass/Stylus 规范的嵌套代码或普通 CSS 结构。无需手动编写复杂的嵌套关系，一键生成整洁、可维护的样式代码。

## 功能特性

- 🚀 **一键转换** : 从选定的模板代码提取 class 直接生成 Sass 嵌套结构或 CSS 结构
- 💡 **智能解析** : 支持 HTML 和 Vue 模板（包括静态 class）
- 🧩 **多种输出格式** :
  - 生成符合 Sass 规范的嵌套选择器
  - 生成使用 & 符号连接的 Sass 嵌套
  - 生成带父子关系的 CSS 规则
  - 生成单一平铺的 CSS 结构
  - 生成符合 Stylus 规范的嵌套选择器
- 🎨 **多场景支持** : 提供快捷键和右键菜单两种操作方式

## 使用方法

### 提取 class 生成 Sass 嵌套结构

- 1.选择一段包含 class 的代码，使用快捷键[ctrl+shift+e]，将自动生成 Sass 嵌套结构并在新标签页打开。示例如下图：

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot1.gif)

- 2.选择一段包含 class 的代码，右键菜单-选择 "Extract Class Structure to Sass"，将自动生成 Sass 代码。示例如下图：

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot2.gif)

- 3.在插件的设置中，勾选`使用&符号实现Sass的嵌套生成`，选中代码后右键点 "Extract Class Structure to Sass"，将生成&连接符风格的 Sass 代码。示例如下图：

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot5.gif)

### 提取 class 生成 CSS 结构

- 1.选择一段包含 class 的代码，使用快捷键[ctrl+shift+t]，选择输出格式，将自动生成 CSS 结构并在新标签页打开。示例如下图：

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot3.gif)

- 2.选择一段包含 class 的代码，右键菜单-选择 "Extract Class Structure to CSS"，选择输出格式，将自动生成 CSS 代码。示例如下图：

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot4.gif)

### 提取 class 生成 Stylus 结构

- 1.选择一段包含 class 的代码，使用快捷键[ctrl+shift+l]，选择输出格式，将自动生成 Stylus 结构并在新标签页打开。示例如下图：

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot6.gif)

- 2.选择一段包含 class 的代码，右键菜单-选择 "Extract Class Structure to Stylus"，选择输出格式，将自动生成 Stylus 代码。

## 问题

如果您遇到任何问题或有改进建议，请点击这里 [Issue Report](https://github.com/z-ti/auto-css-nest/issues)

## 许可证

MIT © 2025 flyfox  
完整协议见 [MIT](https://github.com/z-ti/auto-css-nest/blob/main/LICENSE) 文件
