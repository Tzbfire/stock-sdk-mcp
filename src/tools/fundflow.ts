/**
 * 深度资金流 Tools
 * 包含个股资金流历史、大盘资金流、资金流排名、板块资金流历史
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const StockFundFlowHistorySchema = z.object({
  symbol: z.string().describe('股票代码，如 "600519" 或 "sh600519"'),
  period: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .describe('周期: daily=日(默认), weekly=周, monthly=月'),
});

const FundFlowRankSchema = z.object({
  scope: z
    .enum(['stock', 'sector'])
    .describe('排名范围: stock=个股排名, sector=板块排名'),
  indicator: z
    .enum(['today', '3day', '5day', '10day'])
    .optional()
    .describe('排名周期: today=今日(默认), 3day=3日, 5day=5日, 10day=10日'),
  sectorType: z
    .enum(['industry', 'concept', 'region'])
    .optional()
    .describe('板块类型（scope=sector 时必填）: industry=行业, concept=概念, region=地域'),
});

const SectorFundFlowHistorySchema = z.object({
  symbol: z.string().describe('板块编号，如 "BK0438" 或 "90.BK0438"'),
  period: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .describe('周期: daily=日(默认), weekly=周, monthly=月'),
});

// ==================== Tool 定义 ====================

export const fundflowTools: Tool[] = [
  {
    name: 'get_stock_fund_flow_history',
    description: '获取个股资金流向历史数据（日/周/月），返回主力、超大单、大单、中单、小单的流入流出金额和净额',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '股票代码，如 "600519" 或 "sh600519"' },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: '周期: daily=日(默认), weekly=周, monthly=月',
        },
      },
      required: ['symbol'],
    },
    annotations: { title: '个股资金流历史', readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_market_fund_flow',
    description: '获取大盘资金流向（上证+深证综合），返回主力和散户的流入流出金额趋势',
    inputSchema: { type: 'object', properties: {} },
    annotations: { title: '大盘资金流', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_fund_flow_rank',
    description:
      '获取资金流排名，通过 scope 区分个股排名或板块排名。个股排名返回全市场主力净流入 TOP；板块排名返回行业/概念/地域的资金流排行',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['stock', 'sector'],
          description: '排名范围: stock=个股排名, sector=板块排名',
        },
        indicator: {
          type: 'string',
          enum: ['today', '3day', '5day', '10day'],
          description: '排名周期: today=今日(默认), 3day=3日, 5day=5日, 10day=10日',
        },
        sectorType: {
          type: 'string',
          enum: ['industry', 'concept', 'region'],
          description: '板块类型（scope=sector 时必填）: industry=行业, concept=概念, region=地域',
        },
      },
      required: ['scope'],
    },
    annotations: { title: '资金流排名', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_sector_fund_flow_history',
    description: '获取单个板块的历史资金流数据（日/周/月），返回该板块主力、超大单等资金流入流出趋势',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '板块编号，如 "BK0438" 或 "90.BK0438"' },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: '周期: daily=日(默认), weekly=周, monthly=月',
        },
      },
      required: ['symbol'],
    },
    annotations: { title: '板块资金流历史', readOnlyHint: true, openWorldHint: false },
  },
];

// ==================== Handler 实现 ====================

export function createFundflowHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_stock_fund_flow_history: async (args) => {
      const { symbol, period } = StockFundFlowHistorySchema.parse(args);
      const data = await sdk.getIndividualFundFlow(symbol, { period });
      return { total: data.length, data };
    },

    get_market_fund_flow: async () => {
      const data = await sdk.getMarketFundFlow();
      return { total: data.length, data };
    },

    get_fund_flow_rank: async (args) => {
      const { scope, indicator, sectorType } = FundFlowRankSchema.parse(args);
      if (scope === 'stock') {
        const data = await sdk.getFundFlowRank({ indicator });
        return { total: data.length, data };
      } else {
        if (!sectorType) {
          throw new Error('scope 为 "sector" 时，sectorType 必填（industry/concept/region）');
        }
        const data = await sdk.getSectorFundFlowRank({ indicator, sectorType });
        return { total: data.length, data };
      }
    },

    get_sector_fund_flow_history: async (args) => {
      const { symbol, period } = SectorFundFlowHistorySchema.parse(args);
      const data = await sdk.getSectorFundFlowHistory(symbol, { period });
      return { total: data.length, data };
    },
  };
}
