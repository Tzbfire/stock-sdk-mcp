/**
 * MCP Server 核心逻辑
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StockSDK } from 'stock-sdk';
import { getAllTools, createAllHandlers } from './tools/index.js';
import { getAllResources, createResourceHandlers } from './resources/index.js';

/**
 * 创建 MCP Server 实例
 */
export function createServer(): Server {
  const sdk = new StockSDK();

  const server = new Server(
    {
      name: 'stock-sdk-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // 获取所有 Tool 定义和 Handlers
  const tools = getAllTools();
  const toolHandlers = createAllHandlers(sdk);

  // 获取所有 Resource 定义和 Handlers
  const resources = getAllResources();
  const resourceHandlers = createResourceHandlers(sdk);

  // ==================== 注册 Tool 列表 ====================
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // ==================== 注册 Tool 调用处理 ====================
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = toolHandlers[name];
    if (!handler) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Unknown tool "${name}"`,
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await handler(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // ==================== 注册 Resource 列表 ====================
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: resources.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
    };
  });

  // ==================== 注册 Resource 读取处理 ====================
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    const handler = resourceHandlers[uri];
    if (!handler) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    try {
      const content = await handler();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: content,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read resource "${uri}": ${message}`);
    }
  });

  return server;
}
