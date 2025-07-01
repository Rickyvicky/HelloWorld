#!/bin/bash

# 动态组件系统演示启动脚本

echo "🚀 启动动态组件系统演示..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

echo "📦 安装后端依赖..."
cd backend && npm install
cd ..

echo "📦 安装前端依赖..."
cd frontend && npm install
cd ..

echo "✅ 依赖安装完成"

# 创建启动脚本
cat > run_demo.js << 'EOF'
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动动态组件系统演示...\n');

// 启动后端服务器
console.log('🔧 启动后端 MCP Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`[后端] ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[后端错误] ${data}`);
});

// 等待后端启动
setTimeout(() => {
  console.log('\n🎨 启动前端应用...');
  
  // 检查是否已经创建了简单的前端实现
  const fs = require('fs');
  const frontendPath = path.join(__dirname, 'frontend');
  
  if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
    console.log('⚠️  前端依赖未安装，请运行：');
    console.log('cd frontend && npm install');
    return;
  }
  
  // 启动前端
  const frontend = spawn('npm', ['start'], {
    cwd: frontendPath,
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    process.stdout.write(`[前端] ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`[前端错误] ${data}`);
  });

  // 等待前端启动后运行演示脚本
  setTimeout(() => {
    console.log('\n🎭 运行演示脚本...');
    console.log('请在浏览器中打开 http://localhost:3000 查看效果');
    console.log('演示脚本将在3秒后开始...\n');
    
    setTimeout(() => {
      const demo = spawn('node', ['demo_script.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      demo.on('close', (code) => {
        console.log(`\n🎊 演示脚本执行完成 (代码: ${code})`);
      });
    }, 3000);
  }, 10000);
}, 3000);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务...');
  backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务...');
  backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
});
EOF

echo "🎬 创建演示运行脚本完成"

# 创建简化的前端启动文件（避免React依赖问题）
mkdir -p frontend/public
cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>动态组件系统演示</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .status {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            border-radius: 20px;
            color: white;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
        }
        .connected { background-color: #28a745; }
        .disconnected { background-color: #dc3545; }
        .component {
            margin: 10px;
            padding: 10px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="status" class="status disconnected">未连接</div>
        <div id="root">
            <h1 style="text-align: center; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                动态组件系统演示
            </h1>
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 800px; margin: 20px auto;">
                <h3>系统正在启动...</h3>
                <p>请等待后端服务启动完成，然后运行演示脚本。</p>
                <p>您可以通过以下方式测试系统：</p>
                <ul>
                    <li>运行 <code>node demo_script.js</code> 查看自动演示</li>
                    <li>访问 <code>http://localhost:3001/api/status</code> 检查服务器状态</li>
                    <li>使用 curl 命令测试 API 接口</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        let ws;
        const statusEl = document.getElementById('status');
        const rootEl = document.getElementById('root');

        function connectWebSocket() {
            try {
                ws = new WebSocket('ws://localhost:3001');
                
                ws.onopen = () => {
                    console.log('WebSocket 连接已建立');
                    statusEl.textContent = '已连接';
                    statusEl.className = 'status connected';
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'page_update') {
                            updatePage(message.payload);
                        }
                    } catch (error) {
                        console.error('解析消息失败:', error);
                    }
                };

                ws.onclose = () => {
                    console.log('WebSocket 连接已关闭');
                    statusEl.textContent = '未连接';
                    statusEl.className = 'status disconnected';
                    setTimeout(connectWebSocket, 3000);
                };

                ws.onerror = (error) => {
                    console.error('WebSocket 错误:', error);
                };
            } catch (error) {
                console.error('连接失败:', error);
                setTimeout(connectWebSocket, 3000);
            }
        }

        function updatePage(pageConfig) {
            document.title = pageConfig.title;
            
            const pageHTML = `
                <h1 style="text-align: center; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); margin-bottom: 30px;">
                    ${pageConfig.title}
                </h1>
                ${renderComponents(pageConfig.components)}
            `;
            
            rootEl.innerHTML = pageHTML;
        }

        function renderComponents(components) {
            return components.map(renderComponent).join('');
        }

        function renderComponent(config) {
            const style = Object.entries(config.style || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ');

            switch (config.type) {
                case 'header':
                    return `<h${config.props.level} style="${style}" class="component">${config.props.text}</h${config.props.level}>`;
                
                case 'text':
                    return `<p style="${style}" class="component">${config.props.content}</p>`;
                
                case 'button':
                    return `<button style="${style}" class="component" onclick="handleClick('${config.props.onClick}', '${config.id}')">${config.props.text}</button>`;
                
                case 'image':
                    return `<img src="${config.props.src}" alt="${config.props.alt}" style="${style}" class="component" />`;
                
                case 'card':
                    const cardChildren = (config.children || []).map(renderComponent).join('');
                    const title = config.props.title ? `<h3 style="margin-top: 0;">${config.props.title}</h3>` : '';
                    return `<div style="${style}" class="component">${title}${cardChildren}</div>`;
                
                case 'list':
                    const items = config.props.items.map(item => `<li>${item}</li>`).join('');
                    const tag = config.props.ordered ? 'ol' : 'ul';
                    return `<${tag} style="${style}" class="component">${items}</${tag}>`;
                
                default:
                    return `<div style="${style}" class="component">未知组件类型: ${config.type}</div>`;
            }
        }

        function handleClick(eventName, componentId) {
            console.log(`按钮点击: ${eventName}, 组件ID: ${componentId}`);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'component_event',
                    payload: { eventName, componentId }
                }));
            }
        }

        // 启动连接
        connectWebSocket();
    </script>
</body>
</html>
EOF

# 创建简化的前端package.json
cat > frontend/package.json << 'EOF'
{
  "name": "dynamic-frontend-simple",
  "version": "0.1.0",
  "scripts": {
    "start": "python3 -m http.server 3000 --directory public || python -m http.server 3000 --directory public"
  }
}
EOF

echo "📱 创建简化前端完成"

echo ""
echo "🎉 演示环境准备完成！"
echo ""
echo "启动方式："
echo "1. 运行完整演示: node run_demo.js"
echo "2. 单独启动后端: cd backend && npm run dev"
echo "3. 单独运行演示脚本: node demo_script.js"
echo ""
echo "访问地址："
echo "- 前端页面: http://localhost:3000"
echo "- API文档: http://localhost:3001/api"
echo "- 服务状态: http://localhost:3001/health"
echo ""
echo "现在可以运行: node run_demo.js"