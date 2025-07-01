import { PageConfig, ComponentConfig, ComponentType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ComponentService {
  private pages: Map<string, PageConfig> = new Map();
  private currentPageId: string = 'default';

  constructor() {
    // 初始化默认页面
    this.initializeDefaultPage();
  }

  private initializeDefaultPage(): void {
    const defaultPage: PageConfig = {
      id: 'default',
      title: '动态组件系统演示',
      components: [
        {
          id: 'welcome-header',
          type: ComponentType.HEADER,
          props: { text: '欢迎使用MCP动态组件系统', level: 1 },
          style: { 
            textAlign: 'center', 
            color: 'white', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            marginBottom: '30px'
          }
        },
        {
          id: 'info-card',
          type: ComponentType.CARD,
          props: { title: '系统信息' },
          style: { maxWidth: '800px', margin: '20px auto' },
          children: [
            {
              id: 'description-text',
              type: ComponentType.TEXT,
              props: { 
                content: '这是一个通过MCP (Model Context Protocol) Server控制的动态React组件系统。您可以通过API调用实时更新页面组件配置。',
                size: 'medium'
              }
            },
            {
              id: 'demo-button',
              type: ComponentType.BUTTON,
              props: { 
                text: '点击测试交互',
                variant: 'primary',
                onClick: 'demo_interaction'
              }
            }
          ]
        }
      ]
    };

    this.pages.set('default', defaultPage);
  }

  // 获取当前页面配置
  getCurrentPage(): PageConfig {
    return this.pages.get(this.currentPageId) || this.pages.get('default')!;
  }

  // 更新整个页面配置
  updatePage(pageConfig: PageConfig): void {
    this.pages.set(pageConfig.id, pageConfig);
    if (pageConfig.id === this.currentPageId) {
      // 当前页面已更新
    }
  }

  // 切换到指定页面
  switchToPage(pageId: string): PageConfig | null {
    if (this.pages.has(pageId)) {
      this.currentPageId = pageId;
      return this.pages.get(pageId)!;
    }
    return null;
  }

  // 添加组件到当前页面
  addComponent(component: ComponentConfig, parentId?: string): boolean {
    const currentPage = this.getCurrentPage();
    
    if (!parentId) {
      // 添加到根级别
      currentPage.components.push(component);
      return true;
    } else {
      // 添加到指定父组件
      return this.addComponentToParent(currentPage.components, component, parentId);
    }
  }

  private addComponentToParent(components: ComponentConfig[], component: ComponentConfig, parentId: string): boolean {
    for (const comp of components) {
      if (comp.id === parentId && comp.children) {
        comp.children.push(component);
        return true;
      }
      if (comp.children && this.addComponentToParent(comp.children, component, parentId)) {
        return true;
      }
    }
    return false;
  }

  // 更新指定组件
  updateComponent(componentId: string, updates: Partial<ComponentConfig>): boolean {
    const currentPage = this.getCurrentPage();
    return this.updateComponentInTree(currentPage.components, componentId, updates);
  }

  private updateComponentInTree(components: ComponentConfig[], componentId: string, updates: Partial<ComponentConfig>): boolean {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === componentId) {
        components[i] = { ...components[i], ...updates };
        return true;
      }
      if (components[i].children && this.updateComponentInTree(components[i].children!, componentId, updates)) {
        return true;
      }
    }
    return false;
  }

  // 删除指定组件
  removeComponent(componentId: string): boolean {
    const currentPage = this.getCurrentPage();
    return this.removeComponentFromTree(currentPage.components, componentId);
  }

  private removeComponentFromTree(components: ComponentConfig[], componentId: string): boolean {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === componentId) {
        components.splice(i, 1);
        return true;
      }
      if (components[i].children && this.removeComponentFromTree(components[i].children!, componentId)) {
        return true;
      }
    }
    return false;
  }

  // 创建新组件
  createComponent(type: ComponentType, props: Record<string, any>, style?: Record<string, any>): ComponentConfig {
    return {
      id: uuidv4(),
      type,
      props,
      style,
      children: type === ComponentType.CARD ? [] : undefined
    } as ComponentConfig;
  }

  // 获取所有页面列表
  getAllPages(): PageConfig[] {
    return Array.from(this.pages.values());
  }

  // 创建新页面
  createPage(title: string, components: ComponentConfig[] = []): PageConfig {
    const newPage: PageConfig = {
      id: uuidv4(),
      title,
      components
    };
    this.pages.set(newPage.id, newPage);
    return newPage;
  }

  // 删除页面
  deletePage(pageId: string): boolean {
    if (pageId === 'default') {
      return false; // 不能删除默认页面
    }
    
    if (this.currentPageId === pageId) {
      this.currentPageId = 'default'; // 切换到默认页面
    }
    
    return this.pages.delete(pageId);
  }
}