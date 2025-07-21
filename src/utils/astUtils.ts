import { ClassNode } from '../types/classNode';

// 生成 Sass 结构
export function generateSassNesting(root: ClassNode, indentLevel = 0, appearedCls = new Set<string>()): string {
  let output = '';
  const indent = '  '.repeat(indentLevel);
  // const node of root.children
  for (let i = 0, len = root.children.length; i < len; i++) {
    const node = root.children[i];
    if (node.classes.length > 0) {
      // 过滤掉当前层级已处理的类名
      const uniqueClasses = node.classes.filter(cls => !appearedCls.has(cls));
      
      if (uniqueClasses.length > 0) {
        uniqueClasses.forEach(cls => appearedCls.add(cls));
        
        const selectors = uniqueClasses.map(c => `.${c}`).join(', ');
        
        output += `${indent}${selectors} {\n${node.children?.length ? '': '\n'}`;
        output += generateSassNesting(node, indentLevel + 1, appearedCls);
        output += `${indent}}\n`;
      } else {
        output += generateSassNesting(node, indentLevel, appearedCls);
      }
    } else {
      output += generateSassNesting(node, indentLevel, appearedCls);
    }
  }
  
  return output;
}

// 生成带父子层级关系的 CSS
export function generateHierarchicalCss(root: ClassNode): string {
  const rules: string[] = [];
  const appearedCls = new Set<string>();
  function traverse(node: ClassNode, path: string[] = []) {
    if (node.classes.length > 0) {
      const currentSelector = node.classes.map(c => `.${c}`).join(', ');
      
      const fullSelector = path.length > 0 
        ? `${path.join(' ')} ${currentSelector}` 
        : currentSelector;
      if (!appearedCls.has(fullSelector)) {
        appearedCls.add(fullSelector);
        rules.push(`${fullSelector} {\n\n}\n`);
      }
      
      path = [...path, currentSelector];
    }
    
    for (const child of node.children) {
      traverse(child, [...path]);
    }
  }
  
  traverse(root);
  
  return rules.join('');
}

// 生成单一 CSS 结构
export function generateClassStructure(root: ClassNode): string {
  const allClasses = new Set<string>();
  
  function collectClasses(node: ClassNode) {
    for (const className of node.classes) {
      allClasses.add(className);
    }
    for (const child of node.children) {
      collectClasses(child);
    }
  }
  
  collectClasses(root);
  
  let output = '';
  for (const className of allClasses) {
    output += `.${className} {\n\n}\n`;
  }
  
  return output;
}

export function hasClassAttributes(code: string): boolean {
  return /(^|\s)(class|:class|v-bind:class)\s*=/.test(code);
}