import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { ClassNode } from '../types/classNode';

// JSX属性类型定义
interface JSXAttribute {
  type: 'JSXAttribute';
  name: { name: string };
  value: any;
}

// 解析JSX代码
export function parseJSX(code: string): ClassNode {
  const root = new ClassNode([]);
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript'
      ]
    });
    const stack: ClassNode[] = [root];

    traverse(ast, {
      // 处理JSX元素的进入
      JSXElement: {
        enter(path: any) {
          const classes = extractClassesFromJSXAttributes(
            path.node.openingElement.attributes
          );
          const currentNode = new ClassNode(classes);
        
          const parentNode = stack[stack.length - 1];
          parentNode.addChild(currentNode);
        
          stack.push(currentNode);
        },
        exit() {
          stack.pop();
        }
      }
    });
  } catch (error) {
    throw new Error(`JSX解析错误: ${error.message}`);
  }

  return root;
}

// 从JSX属性中提取类名
function extractClassesFromJSXAttributes(attributes: JSXAttribute[]): string[] {
  const classNames: Set<string> = new Set();
  
  attributes.forEach(attr => {
    if (attr.name.name !== 'className') return;
    
    // 处理不同类型的className值
    if (!attr.value) return;
    
    // 1. 字符串字面量: className="class1 class2"
    if (attr.value.type === 'StringLiteral') {
      attr.value.value.split(/\s+/).forEach(cls => {
        if (cls) classNames.add(cls);
      });
    }
    
    // 2. JSX表达式容器: className={'class1 class2'}
    else if (attr.value.type === 'JSXExpressionContainer') {
      const expr = attr.value.expression;
      
      // 字符串字面量
      if (expr.type === 'StringLiteral') {
        expr.value.split(/\s+/).forEach(cls => {
          if (cls) classNames.add(cls);
        });
      }
      
      // 模板字符串: className={`class1 ${variable}`}
      else if (expr.type === 'TemplateLiteral') {
        expr.quasis.forEach(quasi => {
          if (quasi.value.cooked) {
            quasi.value.cooked.split(/\s+/).forEach(cls => {
              if (cls) classNames.add(cls);
            });
          }
        });
      }
      
      // 数组表达式: className={['class1', 'class2']}
      else if (expr.type === 'ArrayExpression') {
        expr.elements.forEach(element => {
          if (element?.type === 'StringLiteral' && element.value) {
            classNames.add(element.value);
          }
        });
      }
      
      // 对象表达式: className={{class1: true, class2: condition}}
      else if (expr.type === 'ObjectExpression') {
        expr.properties.forEach(prop => {
          if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.value.type === 'BooleanLiteral' &&
            prop.value.value === true
          ) {
            classNames.add(prop.key.name);
          }
        });
      }
    }
  });
  
  return Array.from(classNames);
}