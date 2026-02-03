/**
 * 搜索相关 Tools
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const SearchStockSchema = z.object({
  keyword: z.string().describe('搜索关键词（股票代码、名称或拼音）'),
});

// ==================== Tool 定义 ====================

export const searchTools: Tool[] = [
  {
    name: 'search_stock',
    description:
      '搜索股票，支持按代码、名称、拼音搜索，返回匹配的 A 股、港股、美股结果',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description:
            '搜索关键词，可以是股票代码、名称或拼音，如 "茅台"、"600519"、"maotai"',
        },
      },
      required: ['keyword'],
    },
  },
];

// ==================== Handler 实现 ====================

export function createSearchHandlers(
  sdk: StockSDK
): Record<string, ToolHandler> {
  return {
    search_stock: async (args) => {
      const { keyword } = SearchStockSchema.parse(args);
      return await sdk.search(keyword);
    },
  };
}
