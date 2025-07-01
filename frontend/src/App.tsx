import React, { useState, useEffect, useCallback } from 'react';
import DynamicComponent from './components/DynamicComponent';

// 临时类型定义，避免依赖问题
interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: React.CSSProperties;
  children?: ComponentConfig[];
}

interface PageConfig {
  id: string;
  title: string;
  components: ComponentConfig[];
}

interface WSMessage {
  type: 'page_update' | 'component_update' | 'component_add' | 'component_remove';
  payload: PageConfig | ComponentConfig | string;
}

const App: React.FC = () => {
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    id: 'default',
    title: '动态组件系统演示',
    components: []
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket连接
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket('ws://localhost:3001');
        
        websocket.onopen = () => {
          console.log('WebSocket连接已建立');
          setWsConnected(true);
          setWs(websocket);
        };

        websocket.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        websocket.onclose = () => {
          console.log('WebSocket连接已关闭');
          setWsConnected(false);
          setWs(null);
          // 尝试重连
          setTimeout(connectWebSocket, 3000);
        };

        websocket.onerror = (error) => {
          console.error('WebSocket错误:', error);
        };

      } catch (error) {
        console.error('WebSocket连接失败:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'page_update':
        setPageConfig(message.payload as PageConfig);
        break;
      case 'component_update':
        // 实现组件更新逻辑
        console.log('组件更新:', message.payload);
        break;
      case 'component_add':
        // 实现组件添加逻辑
        console.log('组件添加:', message.payload);
        break;
      case 'component_remove':
        // 实现组件删除逻辑
        console.log('组件删除:', message.payload);
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }, []);

  const handleComponentEvent = useCallback((eventName: string, componentId: string) => {
    console.log(`组件事件: ${eventName}, 组件ID: ${componentId}`);
    
    // 发送事件到服务器
    if (ws && wsConnected) {
      ws.send(JSON.stringify({
        type: 'component_event',
        payload: { eventName, componentId }
      }));
    }
  }, [ws, wsConnected]);

  // 加载默认页面配置
  useEffect(() => {
    const loadDefaultPage = async () => {
      try {
        const response = await fetch('/api/page/default');
        if (response.ok) {
          const defaultPage = await response.json();
          setPageConfig(defaultPage);
        }
      } catch (error) {
        console.log('加载默认页面失败，使用演示数据');
        // 设置演示数据
        setPageConfig({
          id: 'demo',
          title: '动态组件系统演示',
          components: [
            {
              id: 'header-1',
              type: 'header',
              props: { text: '欢迎使用动态组件系统', level: 1 },
              style: { textAlign: 'center', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }
            },
            {
              id: 'card-1',
              type: 'card',
              props: { title: '功能演示' },
              style: { maxWidth: '800px', margin: '20px auto' },
              children: [
                {
                  id: 'text-1',
                  type: 'text',
                  props: { 
                    content: '这是一个通过MCP Server控制的动态组件系统。您可以通过服务器API实时更新页面组件。',
                    size: 'medium'
                  }
                },
                {
                  id: 'button-1',
                  type: 'button',
                  props: { 
                    text: '点击测试',
                    variant: 'primary',
                    onClick: 'test_click'
                  }
                },
                {
                  id: 'list-1',
                  type: 'list',
                  props: {
                    items: [
                      '支持动态组件渲染',
                      '实时WebSocket通信',
                      'TypeScript类型安全',
                      '响应式设计'
                    ],
                    ordered: false
                  }
                }
              ]
            }
          ]
        });
      }
    };

    loadDefaultPage();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 连接状态指示器 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        borderRadius: '20px',
        backgroundColor: wsConnected ? '#28a745' : '#dc3545',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        {wsConnected ? '已连接' : '未连接'}
      </div>

      {/* 页面标题 */}
      <h1 style={{
        textAlign: 'center',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        marginBottom: '30px'
      }}>
        {pageConfig.title}
      </h1>

      {/* 动态组件容器 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {pageConfig.components.map((componentConfig) => (
          <DynamicComponent
            key={componentConfig.id}
            config={componentConfig}
            onEvent={handleComponentEvent}
          />
        ))}
      </div>

      {/* 如果没有组件，显示提示 */}
      {pageConfig.components.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontSize: '18px',
          marginTop: '50px'
        }}>
          等待服务器配置组件...
        </div>
      )}
    </div>
  );
};

export default App;