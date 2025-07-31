import { ClassNode } from '../types/classNode';

export function parseJSX(code: string): ClassNode {
  const root = new ClassNode([]);
  const stack: ClassNode[] = [root];

  // 简化版JSX解析器
  let depth = 0;
  let currentText = '';
  let inTag = false;
  let inClassName = false;
  let inString = false;
  let quoteChar = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    // 处理字符串内容
    if (inString) {
      currentText += char;
      if (char === quoteChar) {
        inString = false;
        if (inClassName) {
          processClassString(currentText.slice(1, -1), stack[stack.length - 1]);
          inClassName = false;
          currentText = '';
        }
      }
      continue;
    }

    switch (char) {
      case '<':
        // 处理自闭合标签
        if (code[i + 1] === '/') {
          depth--;
          if (stack.length > 1) stack.pop();
        } else {
          depth++;
          const newNode = new ClassNode([]);
          stack[stack.length - 1].addChild(newNode);
          stack.push(newNode);
        }
        inTag = true;
        currentText = '';
        break;

      case '>':
        inTag = false;
        break;

      case 'c':
        // 检测 className 属性
        if (inTag && code.substr(i, 9) === 'className') {
          inClassName = true;
          i += 8; // 跳过 "className"
        }
        break;

      case '"':
      case "'":
      case '`':
        if (inClassName) {
          inString = true;
          quoteChar = char;
          currentText = char;
        }
        break;
    }
  }

  return root;
}

function processClassString(classString: string, node: ClassNode) {
  // 处理各种表达式格式
  if (classString.startsWith('{') && classString.endsWith('}')) {
    // 对象表达式: {class1: true, class2: false}
    const objMatch = classString.match(/(\w+)\s*:\s*true/g);
    if (objMatch) {
      objMatch.forEach((match) => {
        const className = match.split(':')[0].trim();
        node.classes.push(className);
      })
    }
  } else if (classString.startsWith('[') && classString.endsWith(']')) {
    // 数组表达式: [class1, class2]
    const classes = classString
      .slice(1, -1)
      .split(',')
      .map((c) => c.trim().replace(/['"`]/g, ''));
    node.classes.push(...classes.filter((c) => c));
  } else {
    // 普通字符串或模板字符串
    const classes = classString.split(/\s+/).filter((c) => c);
    node.classes.push(...classes);
  }
}
