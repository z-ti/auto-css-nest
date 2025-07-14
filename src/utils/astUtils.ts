import { ClassNode } from '../types/classNode';

export function generateSassNesting(root: ClassNode, indentLevel = 0): string {
  let output = '';
  const indent = '  '.repeat(indentLevel);
  // const node of root.children
  for (let i = 0, len = root.children.length; i < len; i++) {
    const node = root.children[i];
    if (node.classes.length > 0) {
      // 处理多个 class 的情况
      const selectors = node.classes.map(c => `.${c}`).join(',\n' + indent);
      output += `${indent}${selectors} {\n${node.children?.length ? '': '\n'}`;
      output += generateSassNesting(node, indentLevel + 1);
      output += `${indent}}\n`;
    } else {
      output += generateSassNesting(node, indentLevel);
    }
  }
  
  return output;
}

export function hasClassAttributes(code: string): boolean {
  return /(^|\s)(class|:class|v-bind:class)\s*=/.test(code);
}