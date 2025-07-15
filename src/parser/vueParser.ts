import { parse, ParserOptions } from '@vue/compiler-dom';
import { ClassNode } from '../types/classNode';

export function parseVueTemplate(template: string): ClassNode {
  const root = new ClassNode([]);
  const options: ParserOptions = {
    comments: true,
    whitespace: 'preserve'
  };
  
  const ast = parse(template, options);
  traverse(ast, root);
  return root;
}

function traverse(node: any, parent: ClassNode): void {
  // 只处理元素节点
  if (node.type === 1 || node.type === 0) {
    const classes = extractClasses(node);
    const currentNode = classes.length > 0 ? new ClassNode(classes) : parent;
    
    if (classes.length > 0) {
      parent.addChild(currentNode);
    }
    
    // 递归处理子节点
    if (node.children) {
      for (const child of node.children) {
        traverse(child, currentNode);
      }
    }
  }
}

function extractClasses(node: any): string[] {
  let classes: string[] = [];
  
  // 静态 class
  const staticClass = node.props?.find(
    (p: any) => p.name === 'class' && p.value
  );
  
  if (staticClass?.value?.content) {
    classes = classes.concat(staticClass.value.content.split(/\s+/));
  }
  
  // 动态 class 如： v-bind:class="'content'"  :class="['content']"  :class="'content'"  :class="{'container5': true}"
  const dynamicClass = node.props?.find(
    (p: any) => (p.rawName === ':class' || p.rawName === 'v-bind:class') && p.exp
  );
  
  if (dynamicClass?.exp?.content) {
    // 简单处理：提取字符串字面量
    const literalMatch = dynamicClass.exp.content.match(/'([^']+)'|"([^"]+)"|`([^`]+)`/);
    if (literalMatch) {
      const literal = literalMatch[1] || literalMatch[2] || literalMatch[3];
      classes = classes.concat(literal.split(/\s+/));
    }
  }

  // 动态 v-bind对象 如： v-bind="{class: 'content'}"  
  const dynamicBindClass = node.props?.find(
    (p: any) => (p.rawName === 'v-bind') && p.exp
  );
  
  if (dynamicBindClass?.exp?.content) {
    // 简单处理：提取字符串字面量
    const literalBindMatch = dynamicBindClass.exp.content.match(/class:\s*['"`]([^'"`]+)['"`]/);
    if (literalBindMatch) {
      const literalBind = literalBindMatch[1];
      classes = classes.concat(literalBind.split(/\s+/));
    }
  }
  
  return [...new Set(classes)].filter(c => c.trim());
}