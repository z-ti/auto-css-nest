import { ClassNode } from '../types/classNode';

// 生成Sass： 标准嵌套结构
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

// 生成Sass： &符号实现类BEM选择器的嵌套
export function generateBemShorthandSass(root: ClassNode, indentLevel = 0, parentBlock = '', appearedCls = new Set<string>()): string {
  let output = '';
  const indent = '  '.repeat(indentLevel);
  for (const node of root.children) {
    
    if (node.classes.length > 0) {
      // 过滤掉当前层级已处理的类名
      const uniqueClasses = node.classes.filter(cls => !appearedCls.has(cls));
      if (uniqueClasses.length > 0) {
        uniqueClasses.forEach(cls => appearedCls.add(cls));
        const selectors = uniqueClasses
          .map(cls => convertToBemShorthand(cls, parentBlock))
          .filter(Boolean)
          .join(', ');
        const currentBlock = uniqueClasses[0] || extractBemBlock(uniqueClasses[0]);
        if (selectors) {
          output += `${indent}${selectors} {\n${node.children?.length ? '' : '\n'}`;
          output += generateBemShorthandSass(node, indentLevel + 1, currentBlock, appearedCls);
          output += `${indent}}\n`;
        } else {
          output += generateBemShorthandSass(node, indentLevel, currentBlock, appearedCls);
        }
      } else {
        output += generateBemShorthandSass(node, indentLevel, parentBlock, appearedCls);
      }
    } else {
      output += generateBemShorthandSass(node, indentLevel, parentBlock, appearedCls);
    }
  }
  
  return output;
}

// 生成Stylus
export function generateStylusNesting(root: ClassNode, indentLevel = 0, appearedCls = new Set<string>()): string {
  let output = '';
  const indent = '  '.repeat(indentLevel);
  for (let i = 0, len = root.children.length; i < len; i++) {
    const node = root.children[i];
    if (node.classes.length > 0) {
      // 过滤掉当前层级已处理的类名
      const uniqueClasses = node.classes.filter(cls => !appearedCls.has(cls));
      
      if (uniqueClasses.length > 0) {
        uniqueClasses.forEach(cls => appearedCls.add(cls));
        
        const selectors = uniqueClasses.map(c => `.${c}`).join(', ');
        
        output += `${indent}${selectors} \n\n`;
        output += generateStylusNesting(node, indentLevel + 1, appearedCls);
      } else {
        output += generateStylusNesting(node, indentLevel, appearedCls);
      }
    } else {
      output += generateStylusNesting(node, indentLevel, appearedCls);
    }
  }
  
  return output;
}

// 生成CSS: 带父子层级关系
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

// 生成CSS: 单一结构
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

// 提取 BEM 块名
function extractBemBlock(className: string): string {
  const bemPattern = /^([a-zA-Z0-9-]+?)(?:__|--|$)/;
  const match = className.match(bemPattern);
  return match ? match[1] : '';
}

// 转换类名为 BEM 简写形式
function convertToBemShorthand(className: string, parentBlock: string): string {
  if (!parentBlock) return `.${className}`;
  
  if (className.startsWith(parentBlock)) {
    const suffix = className.slice(parentBlock.length);
    
    if (suffix.startsWith('__') || suffix.startsWith('--') || suffix.startsWith('-')) {
      return `&${suffix}`;
    }
  }
  
  return `.${className}`;
}

export function hasClassAttributes(code: string): boolean {
  return /(^|\s)(class|:class|v-bind:class)\s*=/.test(code);
}