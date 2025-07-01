# 动态组件系统 - MCP Server Demo

这是一个使用 TypeScript 构建的动态 React 组件系统，通过 MCP (Model Context Protocol) Server 实现对前端页面组件的实时控制。

## 项目架构

```
动态组件系统/
├── frontend/           # React 前端应用
│   ├── src/
│   │   ├── components/ # 动态组件
│   │   ├── types/      # TypeScript 类型定义
│   │   └── App.tsx     # 主应用组件
│   └── package.json
├── backend/            # MCP Server 后端
│   ├── src/
│   │   ├── services/   # 核心服务
│   │   ├── routes/     # API 路由
│   │   └── types/      # 类型定义
│   └── package.json
└── package.json        # 根项目配置
```

## 功能特性

### 🎯 核心功能
- **动态组件渲染**: 支持 Header、Button、Text、Image、Card、List 等组件类型
- **实时更新**: 通过 WebSocket 实现前后端实时通信
- **类型安全**: 完整的 TypeScript 类型定义
- **MCP 协议**: 符合 Model Context Protocol 标准的工具接口

### 🛠️ 可用工具
1. `update_page` - 更新整个页面配置
2. `add_component` - 添加新组件到页面
3. `update_component` - 更新现有组件属性
4. `remove_component` - 删除指定组件
5. `get_current_page` - 获取当前页面配置
6. `create_page` - 创建新页面
7. `switch_page` - 切换到指定页面

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install                    # 根目录
cd frontend && npm install     # 前端
cd ../backend && npm install   # 后端
```

### 2. 启动服务

```bash
# 同时启动前后端（推荐）
npm run dev

# 或分别启动
npm run dev:backend   # 启动后端 (端口 3001)
npm run dev:frontend  # 启动前端 (端口 3000)
```

### 3. 访问应用

- 前端应用: http://localhost:3000
- API 文档: http://localhost:3001/api
- 健康检查: http://localhost:3001/health
- WebSocket: ws://localhost:3001

## API 使用示例

### 基础组件操作

#### 添加组件
```bash
curl -X POST http://localhost:3001/api/components \
  -H "Content-Type: application/json" \
  -d '{
    "type": "button",
    "props": {
      "text": "新按钮",
      "variant": "primary",
      "onClick": "custom_action"
    },
    "style": {
      "backgroundColor": "#28a745"
    }
  }'
```

#### 更新组件
```bash
curl -X PUT http://localhost:3001/api/components/your-component-id \
  -H "Content-Type: application/json" \
  -d '{
    "props": {
      "text": "更新后的按钮文本"
    },
    "style": {
      "backgroundColor": "#ffc107"
    }
  }'
```

#### 删除组件
```bash
curl -X DELETE http://localhost:3001/api/components/your-component-id
```

### MCP 工具调用

#### 使用工具接口添加组件
```bash
curl -X POST http://localhost:3001/api/tools/add_component \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "props": {
      "content": "这是通过MCP工具添加的文本",
      "size": "large"
    },
    "style": {
      "color": "#007bff",
      "textAlign": "center"
    }
  }'
```

#### 获取当前页面配置
```bash
curl http://localhost:3001/api/tools/get_current_page
```

#### 更新整个页面
```bash
curl -X POST http://localhost:3001/api/tools/update_page \
  -H "Content-Type: application/json" \
  -d '{
    "pageConfig": {
      "id": "demo",
      "title": "我的自定义页面",
      "components": [
        {
          "id": "custom-header",
          "type": "header",
          "props": { "text": "自定义标题", "level": 1 },
          "style": { "color": "#28a745", "textAlign": "center" }
        },
        {
          "id": "custom-card",
          "type": "card",
          "props": { "title": "自定义卡片" },
          "children": [
            {
              "id": "card-text",
              "type": "text",
              "props": { "content": "这是卡片内的文本内容", "size": "medium" }
            }
          ]
        }
      ]
    }
  }'
```

## 组件类型说明

### Header 组件
```json
{
  "type": "header",
  "props": {
    "text": "标题文本",
    "level": 1  // 1-6 对应 h1-h6
  },
  "style": { "color": "#333", "textAlign": "center" }
}
```

### Button 组件
```json
{
  "type": "button",
  "props": {
    "text": "按钮文本",
    "variant": "primary",  // primary | secondary | danger
    "onClick": "action_name"  // 事件处理器名称
  },
  "style": { "margin": "10px" }
}
```

### Text 组件
```json
{
  "type": "text",
  "props": {
    "content": "文本内容",
    "size": "medium"  // small | medium | large
  },
  "style": { "fontSize": "16px", "lineHeight": "1.5" }
}
```

### Image 组件
```json
{
  "type": "image",
  "props": {
    "src": "https://example.com/image.jpg",
    "alt": "图片描述",
    "width": 300,
    "height": 200
  },
  "style": { "borderRadius": "8px" }
}
```

### Card 组件（容器）
```json
{
  "type": "card",
  "props": {
    "title": "卡片标题",
    "padding": 20
  },
  "style": { "backgroundColor": "white", "boxShadow": "0 2px 4px rgba(0,0,0,0.1)" },
  "children": [
    // 子组件配置...
  ]
}
```

### List 组件
```json
{
  "type": "list",
  "props": {
    "items": ["项目1", "项目2", "项目3"],
    "ordered": false  // true 为有序列表，false 为无序列表
  },
  "style": { "paddingLeft": "20px" }
}
```

## 开发指南

### 添加新组件类型

1. 在 `backend/src/types/index.ts` 中添加新的组件类型定义
2. 在 `frontend/src/components/DynamicComponent.tsx` 中添加渲染逻辑
3. 更新 `ComponentService.ts` 中的 `createComponent` 方法

### 扩展 MCP 工具

1. 在 `MCPServer.ts` 的 `initializeMCPTools` 方法中添加新工具定义
2. 在 `executeTool` 方法中添加处理逻辑
3. 可选：在 `api.ts` 中添加对应的 HTTP 端点

## 技术栈

- **前端**: React, TypeScript, WebSocket
- **后端**: Node.js, Express, TypeScript, WebSocket
- **协议**: HTTP REST API, WebSocket, MCP (Model Context Protocol)
- **构建工具**: npm workspaces, ts-node-dev

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
