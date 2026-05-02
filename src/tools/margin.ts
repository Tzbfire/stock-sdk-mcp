/**
 * 大宗交易 / 融资融券 Tools
 * 包含大宗交易（总览/明细/按股汇总）和融资融券（账户/标的）
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const BlockTradeSchema = z.object({
  type: z
    .enum(['overview', 'detail', 'daily_stat'])
    .describe('查询类型: overview=市场总览, detail=交易明细, daily_stat=按股汇总'),
  startDate: z
    .string()
    .optional()
    .describe('开始日期 YYYY-MM-DD（type=detail 或 daily_stat 时可用）'),
  endDate: z
    .string()
    .optional()
    .describe('结束日期 YYYY-MM-DD（type=detail 或 daily_stat 时可用）'),
});

const MarginDataSchema = z.object({
  type: z
    .enum(['account', 'target'])
    .describe('查询类型: account=账户统计（两融余额趋势）, target=标的明细（个股融资融券数据）'),
  date: z
    .string()
    .optional()
    .describe('指定交易日 YYYY-MM-DD（type=target 时可用，默认最新交易日）'),
});

// ==================== Tool 定义 ====================

export const marginTools: Tool[] = [
  {
    name: 'get_block_trade',
    description:
      '获取大宗交易数据，通过 type 区分：overview=市场总览（近期统计），detail=交易明细（溢价率、买卖方营业部），daily_stat=按股汇总（每只股票的大宗交易统计）',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['overview', 'detail', 'daily_stat'],
          description: '查询类型: overview=市场总览, detail=交易明细, daily_stat=按股汇总',
        },
        startDate: {
          type: 'string',
          description: '开始日期 YYYY-MM-DD（type=detail 或 daily_stat 时可用）',
        },
        endDate: {
          type: 'string',
          description: '结束日期 YYYY-MM-DD（type=detail 或 daily_stat 时可用）',
        },
      },
      required: ['type'],
    },
    annotations: { title: '大宗交易', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_margin_data',
    description:
      '获取融资融券数据，通过 type 区分：account=账户统计（全市场两融余额和融资/融券趋势），target=标的明细（个股级别的融资融券数据）',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['account', 'target'],
          description: '查询类型: account=账户统计, target=标的明细',
        },
        date: {
          type: 'string',
          description: '指定交易日 YYYY-MM-DD（type=target 时可用，默认最新交易日）',
        },
      },
      required: ['type'],
    },
    annotations: { title: '融资融券', readOnlyHint: true, openWorldHint: true },
  },
];

// ==================== Handler 实现 ====================

export function createMarginHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_block_trade: async (args) => {
      const { type, startDate, endDate } = BlockTradeSchema.parse(args);

      switch (type) {
        case 'overview': {
          const data = await sdk.getBlockTradeMarketStat();
          return { total: data.length, data };
        }
        case 'detail': {
          const data = await sdk.getBlockTradeDetail({ startDate, endDate });
          return { total: data.length, data };
        }
        case 'daily_stat': {
          const data = await sdk.getBlockTradeDailyStat({ startDate, endDate });
          return { total: data.length, data };
        }
      }
    },

    get_margin_data: async (args) => {
      const { type, date } = MarginDataSchema.parse(args);

      switch (type) {
        case 'account': {
          const data = await sdk.getMarginAccountInfo();
          return { total: data.length, data };
        }
        case 'target': {
          const data = await sdk.getMarginTargetList(date);
          return { total: data.length, data };
        }
      }
    },
  };
}
