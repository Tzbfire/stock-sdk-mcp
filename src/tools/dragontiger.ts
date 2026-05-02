/**
 * 龙虎榜 Tools
 * 包含龙虎榜详情、统计（个股/机构/营业部）、席位明细
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const DragonTigerListSchema = z.object({
  startDate: z.string().describe('开始日期 YYYYMMDD，如 "20250401"'),
  endDate: z.string().describe('结束日期 YYYYMMDD，如 "20250430"'),
});

const DragonTigerStatsSchema = z.object({
  type: z
    .enum(['stock_stats', 'institution', 'branch_rank'])
    .describe('统计类型: stock_stats=个股上榜统计, institution=机构买卖统计, branch_rank=营业部排行'),
  period: z
    .enum(['1month', '3month', '6month', '1year'])
    .optional()
    .describe('统计周期（type=stock_stats 或 branch_rank 时使用）: 1month(默认), 3month, 6month, 1year'),
  startDate: z
    .string()
    .optional()
    .describe('开始日期 YYYYMMDD（type=institution 时必填）'),
  endDate: z
    .string()
    .optional()
    .describe('结束日期 YYYYMMDD（type=institution 时必填）'),
});

const DragonTigerSeatDetailSchema = z.object({
  symbol: z.string().describe('股票代码，如 "600519"'),
  date: z.string().describe('上榜日期 YYYYMMDD 或 YYYY-MM-DD'),
});

// ==================== Tool 定义 ====================

export const dragontigerTools: Tool[] = [
  {
    name: 'get_dragon_tiger_list',
    description: '获取龙虎榜详情列表（按日期范围），返回上榜个股、上榜原因、买入/卖出总额等信息',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: '开始日期 YYYYMMDD，如 "20250401"' },
        endDate: { type: 'string', description: '结束日期 YYYYMMDD，如 "20250430"' },
      },
      required: ['startDate', 'endDate'],
    },
    annotations: { title: '龙虎榜详情', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_dragon_tiger_stats',
    description:
      '获取龙虎榜统计数据，通过 type 区分：stock_stats=个股上榜频次和净买入统计，institution=机构席位买卖统计，branch_rank=营业部排行。注意：institution 需要 startDate/endDate，其他两种使用 period',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['stock_stats', 'institution', 'branch_rank'],
          description: '统计类型: stock_stats=个股上榜统计, institution=机构买卖统计, branch_rank=营业部排行',
        },
        period: {
          type: 'string',
          enum: ['1month', '3month', '6month', '1year'],
          description: '统计周期（type=stock_stats 或 branch_rank 时使用），默认 1month',
        },
        startDate: {
          type: 'string',
          description: '开始日期 YYYYMMDD（type=institution 时必填）',
        },
        endDate: {
          type: 'string',
          description: '结束日期 YYYYMMDD（type=institution 时必填）',
        },
      },
      required: ['type'],
    },
    annotations: { title: '龙虎榜统计', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_dragon_tiger_seat_detail',
    description: '获取个股某日上榜的席位明细（买入榜+卖出榜合并），查看具体哪些机构/营业部参与交易',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '股票代码，如 "600519"' },
        date: { type: 'string', description: '上榜日期 YYYYMMDD 或 YYYY-MM-DD' },
      },
      required: ['symbol', 'date'],
    },
    annotations: { title: '龙虎榜席位明细', readOnlyHint: true, openWorldHint: false },
  },
];

// ==================== Handler 实现 ====================

export function createDragontigerHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_dragon_tiger_list: async (args) => {
      const { startDate, endDate } = DragonTigerListSchema.parse(args);
      const data = await sdk.getDragonTigerDetail({ startDate, endDate });
      return { total: data.length, data };
    },

    get_dragon_tiger_stats: async (args) => {
      const { type, period, startDate, endDate } = DragonTigerStatsSchema.parse(args);

      switch (type) {
        case 'stock_stats': {
          const data = await sdk.getDragonTigerStockStats(period ?? '1month');
          return { total: data.length, data };
        }
        case 'institution': {
          if (!startDate || !endDate) {
            throw new Error('type 为 "institution" 时，startDate 和 endDate 必填');
          }
          const data = await sdk.getDragonTigerInstitution({ startDate, endDate });
          return { total: data.length, data };
        }
        case 'branch_rank': {
          const data = await sdk.getDragonTigerBranchRank(period ?? '1month');
          return { total: data.length, data };
        }
      }
    },

    get_dragon_tiger_seat_detail: async (args) => {
      const { symbol, date } = DragonTigerSeatDetailSchema.parse(args);
      const data = await sdk.getDragonTigerStockSeatDetail(symbol, date);
      return { total: data.length, data };
    },
  };
}
