import { ComponentService } from './ComponentService';
import { ComponentType, ComponentConfig, PageConfig, MCPTool, WSMessage, ComponentEvent } from '../types';
import WebSocket from 'ws';

export class MCPServer {
  private componentService: ComponentService;
  private wsClients: Set<WebSocket> = new Set();
  private tools: MCPTool[] = [];

  constructor() {
    this.componentService = new ComponentService();
    this.initializeMCPTools();
  }

  private initializeMCPTools(): void {
    this.tools = [
      {
        name: 'update_page',
        description: '更新整个页面配置',
        inputSchema: {
          type: 'object',
          properties: {
            pageConfig: {
              type: 'object',
              description: '完整的页面配置对象'
            }
          },
          required: ['pageConfig']
        }
      },
      {
        name: 'add_component',
        description: '添加新组件到页面',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: Object.values(ComponentType),
              description: '组件类型'
            },
            props: {
              type: 'object',
              description: '组件属性对象'
            },
            style: {
              type: 'object',
              description: '组件样式对象（可选）'
            },
            parentId: {
              type: 'string',
              description: '父组件ID（可选，不指定则添加到根级别）'
            }
          },
          required: ['type', 'props']
        }
      },
      {
        name: 'update_component',
        description: '更新现有组件',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: '要更新的组件ID'
            },
            props: {
              type: 'object',
              description: '新的组件属性'
            },
            style: {
              type: 'object',
              description: '新的组件样式'
            }
          },
          required: ['componentId']
        }
      },
      {
        name: 'remove_component',
        description: '删除指定组件',
        inputSchema: {
          type: 'object',
          properties: {
            componentId: {
              type: 'string',
              description: '要删除的组件ID'
            }
          },
          required: ['componentId']
        }
      },
      {
        name: 'get_current_page',
        description: '获取当前页面配置',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'create_page',
        description: '创建新页面',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: '页面标题'
            },
            components: {
              type: 'array',
              description: '初始组件列表（可选）'
            }
          },
          required: ['title']
        }
      },
      {
        name: 'switch_page',
        description: '切换到指定页面',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: '要切换到的页面ID'
            }
          },
          required: ['pageId']
        }
      }
    ];
  }

  // 获取可用工具列表
  getTools(): MCPTool[] {
    return this.tools;
  }

  // 执行工具调用
  async executeTool(toolName: string, parameters: any): Promise<any> {
    try {
      switch (toolName) {
        case 'update_page':
          return this.handleUpdatePage(parameters.pageConfig);
        
        case 'add_component':
          return this.handleAddComponent(
            parameters.type,
            parameters.props,
            parameters.style,
            parameters.parentId
          );
        
        case 'update_component':
          return this.handleUpdateComponent(
            parameters.componentId,
            parameters.props,
            parameters.style
          );
        
        case 'remove_component':
          return this.handleRemoveComponent(parameters.componentId);
        
        case 'get_current_page':
          return this.handleGetCurrentPage();
        
        case 'create_page':
          return this.handleCreatePage(parameters.title, parameters.components);
        
        case 'switch_page':
          return this.handleSwitchPage(parameters.pageId);
        
        default:
          throw new Error(`未知的工具: ${toolName}`);
      }
    } catch (error) {
      console.error(`执行工具 ${toolName} 失败:`, error);
      throw error;
    }
  }

  private handleUpdatePage(pageConfig: PageConfig): any {
    this.componentService.updatePage(pageConfig);
    this.broadcastToClients({
      type: 'page_update',
      payload: pageConfig
    });
    
    return {
      success: true,
      message: '页面更新成功',
      data: pageConfig
    };
  }

  private handleAddComponent(type: ComponentType, props: any, style?: any, parentId?: string): any {
    const component = this.componentService.createComponent(type, props, style);
    const success = this.componentService.addComponent(component, parentId);
    
    if (success) {
      this.broadcastToClients({
        type: 'component_add',
        payload: component
      });
      
      // 发送完整页面更新以确保同步
      const currentPage = this.componentService.getCurrentPage();
      this.broadcastToClients({
        type: 'page_update',
        payload: currentPage
      });
      
      return {
        success: true,
        message: '组件添加成功',
        data: component
      };
    } else {
      throw new Error('添加组件失败');
    }
  }

  private handleUpdateComponent(componentId: string, props?: any, style?: any): any {
    const updates: Partial<ComponentConfig> = {};
    if (props) updates.props = props;
    if (style) updates.style = style;
    
    const success = this.componentService.updateComponent(componentId, updates);
    
    if (success) {
      this.broadcastToClients({
        type: 'component_update',
        payload: { componentId, updates }
      });
      
      // 发送完整页面更新
      const currentPage = this.componentService.getCurrentPage();
      this.broadcastToClients({
        type: 'page_update',
        payload: currentPage
      });
      
      return {
        success: true,
        message: '组件更新成功',
        data: { componentId, updates }
      };
    } else {
      throw new Error('更新组件失败：组件未找到');
    }
  }

  private handleRemoveComponent(componentId: string): any {
    const success = this.componentService.removeComponent(componentId);
    
    if (success) {
      this.broadcastToClients({
        type: 'component_remove',
        payload: componentId
      });
      
      // 发送完整页面更新
      const currentPage = this.componentService.getCurrentPage();
      this.broadcastToClients({
        type: 'page_update',
        payload: currentPage
      });
      
      return {
        success: true,
        message: '组件删除成功',
        data: { componentId }
      };
    } else {
      throw new Error('删除组件失败：组件未找到');
    }
  }

  private handleGetCurrentPage(): any {
    const currentPage = this.componentService.getCurrentPage();
    return {
      success: true,
      message: '获取当前页面成功',
      data: currentPage
    };
  }

  private handleCreatePage(title: string, components?: ComponentConfig[]): any {
    const newPage = this.componentService.createPage(title, components);
    return {
      success: true,
      message: '页面创建成功',
      data: newPage
    };
  }

  private handleSwitchPage(pageId: string): any {
    const page = this.componentService.switchToPage(pageId);
    
    if (page) {
      this.broadcastToClients({
        type: 'page_update',
        payload: page
      });
      
      return {
        success: true,
        message: '页面切换成功',
        data: page
      };
    } else {
      throw new Error('切换页面失败：页面未找到');
    }
  }

  // WebSocket 客户端管理
  addWebSocketClient(ws: WebSocket): void {
    this.wsClients.add(ws);
    
    // 发送当前页面配置给新连接的客户端
    const currentPage = this.componentService.getCurrentPage();
    ws.send(JSON.stringify({
      type: 'page_update',
      payload: currentPage
    }));
    
    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    });
  }

  private handleWebSocketMessage(message: any): void {
    // 处理来自前端的消息，如组件事件
    if (message.type === 'component_event') {
      const event: ComponentEvent = {
        eventName: message.payload.eventName,
        componentId: message.payload.componentId,
        timestamp: Date.now()
      };
      
      console.log('收到组件事件:', event);
      // 这里可以根据需要处理组件事件
    }
  }

  private broadcastToClients(message: WSMessage): void {
    const messageStr = JSON.stringify(message);
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // 获取服务状态
  getStatus(): any {
    return {
      connectedClients: this.wsClients.size,
      totalPages: this.componentService.getAllPages().length,
      currentPage: this.componentService.getCurrentPage().title,
      availableTools: this.tools.length
    };
  }
}