export class ClassNode {
  constructor(
    public classes: string[],
    public children: ClassNode[] = []
  ) {}

  // 添加子节点
  addChild(child: ClassNode): void {
    this.children.push(child);
  }

  // 检查节点是否有内容
  hasContent(): boolean {
    return this.classes.length > 0 || this.children.some(child => child.hasContent());
  }
}