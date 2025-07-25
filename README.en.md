# Auto CSS Nest

[![auto-css-next](https://img.shields.io/github/v/tag/z-ti/auto-css-nest?color=blue&label=version)](https://github.com/z-ti/auto-css-nest)
[![License: MIT](https://img.shields.io/github/license/z-ti/auto-css-nest)](https://github.com/z-ti/auto-css-nest/blob/main/LICENSE)

English | [简体中文](./README.md)

## Introduction

Automated CSS Structure Generator: Simply select DOM snippets (HTML/Vue/etc.) to instantly generate corresponding nested code (Sass/Less/Stylus/CSS/etc.), with customizable output formats and styling rules.

## Features

- 🚀 **One-Click Conversion** : Extract classes from selected template code to directly generate Sass nested structures or CSS structures‌
- 💡 **Intelligent Parsing** : Supports HTML and Vue templates (including static classes)
- 🧩 **Multiple Output Formats** :
  - Generate Sass-compliant nested selectors‌
  - Generate Less-compliant nested selectors‌
  - Generate Stylus-compliant nested selectors‌
  - Generate Sass/Less nesting with ‌&‌ symbol connectors‌
  - Generate CSS rules with parent-child relationships‌
  - Generate flat single-layer CSS structures‌
- 🎨 **Multi-Scenario Support** :
  - Supports extracting classes and generating structure after selection via hotkey
  - Supports extracting classes and generating structure after selection via right-click menu
  - Supports direct injection of the generated structure at the end of the Vue file after selection

## Usage

### Extract Class to Generate Sass Nested Structures

- 1.Select a code snippet containing classes and use the shortcut key [ctrl+shift+e] to automatically generate a Sass nested structure and open it in a new tab. An example is shown below:

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot1.gif)

- 2.Select a code snippet containing classes, right-click and select "Extract Class Structure to Sass" from the context menu to automatically generate Sass code. An example is shown below:

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot2.gif)

- 3.In the plugin settings‌, check the option ‌"Use & symbol for Sass nesting generation"‌. Then right-click on the selected code and choose ‌"Extract Class Structure to Sass"‌ to generate Sass code with ‌&‌ connector style. An example is shown below:

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot5.gif)

### Extract Class to Generate CSS Normal Structures

- 1.Select a code snippet containing classes, use the shortcut [ctrl+shift+t], choose the output format, and the CSS structure will be automatically generated and opened in a new tab. An example is shown below:

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot3.gif)

- 2.‌Select a code snippet containing classes, right-click and choose "Extract Class Structure to CSS", select the output format, and the CSS code will be automatically generated. An example is shown below:

![Right Click Menu](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot4.gif)

### Extract Class to Generate Stylus Nested Structures

- 1.Select a code snippet containing classes, use the shortcut [ctrl+shift+l], choose the output format, and the Stylus structure will be automatically generated and opened in a new tab. An example is shown below:

![Shortcut Keys](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot6.gif)

- 2.‌Select a code snippet containing classes, right-click and choose "Extract Class Structure to Stylus", select the output format, and the Stylus code will be automatically generated.

### Extract Class to Generate Less Nested Structures

- 1.Select a code snippet containing classes, use the shortcut [ctrl+shift+s], choose the output format, and the Less structure will be automatically generated and opened in a new tab.

- 2.‌Select a code snippet containing classes, right-click and choose "Extract Class Structure to Less", select the output format, and the Less code will be automatically generated.

### Support injecting generated style structures directly into the `<style>` tag at the end of Vue files

- 1.In the plugin settings, check ‌Automatically inject generated styles into the `<style>` tag at the end of Vue files‌. If you also enable ‌Add scoped attribute to injected styles‌, the generated code structure at the end of the Vue file will include the scoped attribute in the `<style>` tag. Example shown below:

![Auto Insert](https://raw.githubusercontent.com/z-ti/auto-css-nest/main/images/screenshot7.gif)

## Issues

If you encounter any issues or have suggestions for improvements, please click here [Issue Report](https://github.com/z-ti/auto-css-nest/issues)

## License

[MIT](https://github.com/z-ti/auto-css-nest/blob/master/LICENSE)

Copyright (c) 2025-present flyfox
