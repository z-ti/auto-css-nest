# auto-css-nest

> Automated CSS Structure Generator: Simply select DOM snippets (HTML/Vue/etc.) to instantly generate corresponding nested code (Sass/etc.), with customizable output formats and styling rules.

## 基础功能

- [x] 实现基础功能:从 html/vue 中 css 提取，并生成 sass 结构，支持快捷键(ctrl+shift+e)和右键菜单
- [ ] 支持&-xxx 连接符（默认没有，可配置）
- [ ] 生成 css 的 class 非嵌套结构，生成 stylus 的 class 结构（默认 sass，可配置）
- [ ] 支持自动生成 style lang="scss" scoped> 然后把 class 结构放入，自动插入到文件最下方（可配置或者用新的快捷键+菜单）
- [ ] 支持 ctrl+shift+c 快捷键，可以把选中的 dom 结构对应的 class 结构放入剪切板，然后用户在任意想插入的位置 ctrl+v 即可.
      支持 ctrl+shift+v 快捷键, 可以把任意来源的剪切板内容（需要区分 vue/react/html），如飞书或网页中 copy 的 dom 结构直接转化成 clas 结构，并粘贴
- [ ] 支持生成一个 webview 的可视化网页，左侧是 dom 结构，右侧是生成的 class 结构，其中右侧可以勾选&-xxx 连接符/class 非嵌套结构/sass 嵌套结构/stylus 结构等
- [ ] 支持 react 的生成功能

## 项目运行

```bash
# 安装依赖
pnpm install

# 开发环境编译代码
npm run dev

# 发布前编译代码
npm run build

# 项目调试
按`F5`打开调试窗口，打开项目进行调试

# 本地打包插件文件
cd out
vsce package

# 发布插件市场
vsce publish
```
