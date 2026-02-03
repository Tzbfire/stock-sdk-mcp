/**
 * 批量查询相关 Tools
 * 获取股票代码列表
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const GetAShareCodeListSchema = z.object({
  market: z
    .enum(['all', 'sh', 'sz', 'bj', 'kc', 'cy'])
    .optional()
    .describe(
      '市场筛选: all=全部, sh=上证, sz=深证, bj=北证, kc=科创板, cy=创业板'
    ),
  simple: z
    .boolean()
    .optional()
    .describe('是否返回简单代码（不带交易所前缀），默认 false'),
});

const GetUSCodeListSchema = z.object({
  market: z
    .enum(['all', 'NASDAQ', 'NYSE'])
    .optional()
    .describe('市场筛选: all=全部, NASDAQ=纳斯达克, NYSE=纽交所'),
  simple: z
    .boolean()
    .optional()
    .describe('是否返回简单代码（不带市场前缀），默认 false'),
});

// ==================== Tool 定义 ====================

export const batchTools: Tool[] = [
  {
    name: 'get_a_share_code_list',
    description:
      '获取全部 A 股代码列表（5000+ 只），支持按市场筛选（上证/深证/北证/科创板/创业板）',
    inputSchema: {
      type: 'object',
      properties: {
        market: {
          type: 'string',
          enum: ['all', 'sh', 'sz', 'bj', 'kc', 'cy'],
          description:
            '市场筛选: all=全部(默认), sh=上证, sz=深证, bj=北证, kc=科创板, cy=创业板',
        },
        simple: {
          type: 'boolean',
          description: '是否返回简单代码（不带交易所前缀），默认 false',
        },
      },
    },
  },
  {
    name: 'get_hk_code_list',
    description: '获取全部港股代码列表（2000+ 只）',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_us_code_list',
    description:
      '获取全部美股代码列表（8000+ 只），支持按市场筛选（纳斯达克/纽交所）',
    inputSchema: {
      type: 'object',
      properties: {
        market: {
          type: 'string',
          enum: ['all', 'NASDAQ', 'NYSE'],
          description: '市场筛选: all=全部(默认), NASDAQ=纳斯达克, NYSE=纽交所',
        },
        simple: {
          type: 'boolean',
          description: '是否返回简单代码（不带市场前缀），默认 false',
        },
      },
    },
  },
  {
    name: 'get_fund_code_list',
    description: '获取全部基金代码列表（26000+ 只）',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ==================== Handler 实现 ====================

export function createBatchHandlers(
  sdk: StockSDK
): Record<string, ToolHandler> {
  return {
    get_a_share_code_list: async (args) => {
      const { market, simple } = GetAShareCodeListSchema.parse(args);
      const options: { market?: 'sh' | 'sz' | 'bj' | 'kc' | 'cy'; simple?: boolean } = {};
      if (market && market !== 'all') {
        options.market = market as 'sh' | 'sz' | 'bj' | 'kc' | 'cy';
      }
      if (simple !== undefined) {
        options.simple = simple;
      }
      const codes = await sdk.getAShareCodeList(options);
      return {
        total: codes.length,
        codes,
      };
    },

    get_hk_code_list: async () => {
      const codes = await sdk.getHKCodeList();
      return {
        total: codes.length,
        codes,
      };
    },

    get_us_code_list: async (args) => {
      const { market, simple } = GetUSCodeListSchema.parse(args);
      const options: { market?: 'NASDAQ' | 'NYSE'; simple?: boolean } = {};
      if (market && market !== 'all') {
        options.market = market as 'NASDAQ' | 'NYSE';
      }
      if (simple !== undefined) {
        options.simple = simple;
      }
      const codes = await sdk.getUSCodeList(options);
      return {
        total: codes.length,
        codes,
      };
    },

    get_fund_code_list: async () => {
      const codes = await sdk.getFundCodeList();
      return {
        total: codes.length,
        codes,
      };
    },
  };
}
