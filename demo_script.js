#!/usr/bin/env node

/**
 * 动态组件系统演示脚本
 * 展示如何通过 MCP Server API 控制前端页面组件
 */

const http = require('http');

const API_BASE = 'http://localhost:3001/api';

// HTTP 请求辅助函数
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function demoScript() {
  console.log('🚀 动态组件系统演示开始...\n');

  try {
    // 1. 检查服务器状态
    console.log('1️⃣ 检查服务器状态...');
    const status = await makeRequest('/status');
    console.log('✅ 服务器状态:', status);
    await delay(2000);

    // 2. 获取可用工具
    console.log('\n2️⃣ 获取可用 MCP 工具...');
    const tools = await makeRequest('/tools');
    console.log('🛠️ 可用工具:', tools.data.map(t => t.name).join(', '));
    await delay(2000);

    // 3. 获取当前页面配置
    console.log('\n3️⃣ 获取当前页面配置...');
    const currentPage = await makeRequest('/page/current');
    console.log('📄 当前页面:', currentPage.data.title);
    console.log('📦 组件数量:', currentPage.data.components.length);
    await delay(2000);

    // 4. 添加一个新的标题组件
    console.log('\n4️⃣ 添加新的标题组件...');
    const newHeader = await makeRequest('/tools/add_component', 'POST', {
      type: 'header',
      props: {
        text: '🎉 通过API动态添加的标题',
        level: 2
      },
      style: {
        color: '#ff6b6b',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }
    });
    console.log('✅ 标题组件已添加:', newHeader.data.id);
    await delay(3000);

    // 5. 添加一个卡片组件（包含子组件）
    console.log('\n5️⃣ 添加带子组件的卡片...');
    const cardComponent = await makeRequest('/tools/add_component', 'POST', {
      type: 'card',
      props: {
        title: '🔥 动态演示卡片',
        padding: 25
      },
      style: {
        maxWidth: '600px',
        margin: '20px auto',
        backgroundColor: '#f8f9fa',
        border: '2px solid #007bff',
        borderRadius: '12px'
      }
    });
    console.log('✅ 卡片组件已添加:', cardComponent.data.id);
    await delay(2000);

    // 6. 在卡片中添加文本组件
    console.log('\n6️⃣ 在卡片中添加文本组件...');
    const textInCard = await makeRequest('/tools/add_component', 'POST', {
      type: 'text',
      props: {
        content: '这是一个通过 MCP Server API 动态创建的文本组件。它展示了如何实时控制前端页面的组件结构。',
        size: 'medium'
      },
      style: {
        lineHeight: '1.6',
        color: '#495057'
      },
      parentId: cardComponent.data.id
    });
    console.log('✅ 文本组件已添加到卡片中:', textInCard.data.id);
    await delay(2000);

    // 7. 在卡片中添加交互按钮
    console.log('\n7️⃣ 在卡片中添加交互按钮...');
    const buttonInCard = await makeRequest('/tools/add_component', 'POST', {
      type: 'button',
      props: {
        text: '🎯 点击我试试',
        variant: 'primary',
        onClick: 'demo_button_click'
      },
      style: {
        fontSize: '16px',
        padding: '12px 30px',
        borderRadius: '25px',
        fontWeight: 'bold'
      },
      parentId: cardComponent.data.id
    });
    console.log('✅ 按钮组件已添加到卡片中:', buttonInCard.data.id);
    await delay(3000);

    // 8. 添加图片组件
    console.log('\n8️⃣ 添加图片组件...');
    const imageComponent = await makeRequest('/tools/add_component', 'POST', {
      type: 'image',
      props: {
        src: 'https://via.placeholder.com/400x200/007bff/ffffff?text=Dynamic+Component+Demo',
        alt: '动态组件演示图片',
        width: 400,
        height: 200
      },
      style: {
        display: 'block',
        margin: '20px auto',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    });
    console.log('✅ 图片组件已添加:', imageComponent.data.id);
    await delay(3000);

    // 9. 添加列表组件
    console.log('\n9️⃣ 添加功能列表组件...');
    const listComponent = await makeRequest('/tools/add_component', 'POST', {
      type: 'list',
      props: {
        items: [
          '✨ 动态组件渲染',
          '🔄 实时页面更新',
          '🎯 TypeScript 类型安全',
          '🌐 WebSocket 实时通信',
          '🛠️ MCP 协议支持',
          '📱 响应式设计'
        ],
        ordered: false
      },
      style: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        margin: '20px auto'
      }
    });
    console.log('✅ 列表组件已添加:', listComponent.data.id);
    await delay(3000);

    // 10. 更新按钮样式
    console.log('\n🔟 更新按钮组件样式...');
    const updatedButton = await makeRequest(`/components/${buttonInCard.data.id}`, 'PUT', {
      props: {
        text: '🎉 已更新的按钮',
        variant: 'danger'
      },
      style: {
        backgroundColor: '#28a745',
        fontSize: '18px',
        padding: '15px 40px',
        borderRadius: '30px',
        transform: 'scale(1.05)',
        transition: 'all 0.3s ease'
      }
    });
    console.log('✅ 按钮已更新');
    await delay(3000);

    // 11. 演示完整页面更新
    console.log('\n1️⃣1️⃣ 演示完整页面更新...');
    const customPage = await makeRequest('/tools/update_page', 'POST', {
      pageConfig: {
        id: 'demo-complete',
        title: '🎊 完整演示页面',
        components: [
          {
            id: 'demo-final-header',
            type: 'header',
            props: { text: '演示完成！', level: 1 },
            style: { 
              textAlign: 'center', 
              color: '#28a745',
              fontSize: '3rem',
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
              marginBottom: '30px'
            }
          },
          {
            id: 'demo-final-card',
            type: 'card',
            props: { title: '🎯 演示总结' },
            style: { 
              maxWidth: '800px', 
              margin: '0 auto',
              backgroundColor: '#e8f5e8',
              border: '3px solid #28a745'
            },
            children: [
              {
                id: 'summary-text',
                type: 'text',
                props: { 
                  content: '恭喜！您已经成功体验了通过 MCP Server 控制 React 前端组件的完整流程。这个系统展示了如何实现：',
                  size: 'large'
                },
                style: { fontWeight: 'bold', marginBottom: '15px' }
              },
              {
                id: 'features-list',
                type: 'list',
                props: {
                  items: [
                    '动态组件创建和更新',
                    '实时前后端通信',
                    '类型安全的组件配置',
                    'MCP 协议标准化接口',
                    '响应式组件设计'
                  ],
                  ordered: true
                },
                style: { fontSize: '16px' }
              },
              {
                id: 'final-button',
                type: 'button',
                props: { 
                  text: '🎉 演示完成',
                  variant: 'primary',
                  onClick: 'demo_complete'
                },
                style: { 
                  fontSize: '20px',
                  padding: '15px 50px',
                  margin: '20px auto',
                  display: 'block',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '50px',
                  fontWeight: 'bold'
                }
              }
            ]
          }
        ]
      }
    });
    console.log('✅ 页面更新完成！');

    console.log('\n🎊 演示脚本执行完成！');
    console.log('👀 请查看前端页面 http://localhost:3000 查看效果');
    console.log('📖 更多API用法请查看 README.md');

  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error.message);
    console.log('💡 请确保后端服务正在运行 (npm run dev:backend)');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  demoScript();
}

module.exports = { demoScript, makeRequest };