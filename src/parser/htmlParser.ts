import * as parse5 from 'parse5';
import { ClassNode } from '../types/classNode';

export function parseHTML(html: string): ClassNode {
  const root = new ClassNode([]);
  const fragment = parse5.parseFragment(html);
  
  traverse(fragment, root);
  return root;
}

function traverse(node: any, parent: ClassNode): void {
  // 跳过文本和注释节点
  if (node.nodeName === '#text' || node.nodeName === '#comment') return;
  
  // 提取 class 属性
  const classes = extractClasses(node);
  const currentNode = classes.length > 0 ? new ClassNode(classes) : parent;
  
  if (classes.length > 0) {
    parent.addChild(currentNode);
  }
  
  // 递归处理子节点
  if (node.childNodes) {
    for (const child of node.childNodes) {
      traverse(child, currentNode);
    }
  }
}

function extractClasses(node: {attrs?: Array<{name: string, value: string}>}): string[] {
  const classAttr = (node.attrs || []).find(
    (attr: any) => attr.name === 'class'
  );
  
  return classAttr?.value 
    ? [...new Set(classAttr.value.split(/\s+/))].filter(c => c.trim())
    : [];
}