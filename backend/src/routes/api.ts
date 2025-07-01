import { Router, Request, Response } from 'express';
import { MCPServer } from '../services/MCPServer';

export function createApiRouter(mcpServer: MCPServer): Router {
  const router = Router();

  // 获取可用工具列表
  router.get('/tools', (req: Request, res: Response) => {
    try {
      const tools = mcpServer.getTools();
      res.json({
        success: true,
        data: tools
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get tools',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 执行工具调用
  router.post('/tools/:toolName', async (req: Request, res: Response) => {
    try {
      const { toolName } = req.params;
      const parameters = req.body;
      
      const result = await mcpServer.executeTool(toolName, parameters);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Tool execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 获取当前页面配置
  router.get('/page/current', async (req: Request, res: Response) => {
    try {
      const result = await mcpServer.executeTool('get_current_page', {});
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get current page',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 获取默认页面配置（为前端提供）
  router.get('/page/default', async (req: Request, res: Response) => {
    try {
      const result = await mcpServer.executeTool('get_current_page', {});
      res.json(result.data);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get default page',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 获取服务器状态
  router.get('/status', (req: Request, res: Response) => {
    try {
      const status = mcpServer.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 快捷操作：添加组件
  router.post('/components', async (req: Request, res: Response) => {
    try {
      const { type, props, style, parentId } = req.body;
      const result = await mcpServer.executeTool('add_component', {
        type,
        props,
        style,
        parentId
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to add component',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 快捷操作：更新组件
  router.put('/components/:componentId', async (req: Request, res: Response) => {
    try {
      const { componentId } = req.params;
      const { props, style } = req.body;
      const result = await mcpServer.executeTool('update_component', {
        componentId,
        props,
        style
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update component',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 快捷操作：删除组件
  router.delete('/components/:componentId', async (req: Request, res: Response) => {
    try {
      const { componentId } = req.params;
      const result = await mcpServer.executeTool('remove_component', {
        componentId
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to remove component',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}