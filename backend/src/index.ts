import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { MCPServer } from './services/MCPServer';
import { createApiRouter } from './routes/api';

const app = express();
const port = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 创建MCP服务器实例
const mcpServer = new MCPServer();

// API路由
app.use('/api', createApiRouter(mcpServer));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 创建HTTP服务器
const server = createServer(app);

// 创建WebSocket服务器
const wss = new WebSocketServer({ 
  server,
  path: '/'
});

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  console.log('新的WebSocket连接已建立');
  
  // 将客户端添加到MCP服务器
  mcpServer.addWebSocketClient(ws);
  
  ws.on('close', () => {
    console.log('WebSocket连接已关闭');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 启动服务器
server.listen(port, () => {
  console.log(`🚀 MCP Server 正在运行在端口 ${port}`);
  console.log(`📊 API 端点: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket 端点: ws://localhost:${port}`);
  console.log(`💚 健康检查: http://localhost:${port}/health`);
  
  // 显示可用的工具
  const tools = mcpServer.getTools();
  console.log(`🛠️  可用工具: ${tools.map(t => t.name).join(', ')}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});