/**
 * 期货数据相关 Tools
 * 包含国内期货 K 线、全球期货行情/K 线、仓单/库存数据
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const FuturesKlineSchema = z.object({
  symbol: z.string().describe('期货代码，如 "rb2605"（螺纹钢）、"RBM"（螺纹钢主力）'),
  period: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .describe('K 线周期: daily=日线(默认), weekly=周线, monthly=月线'),
  startDate: z.string().optional().describe('开始日期，格式 YYYYMMDD'),
  endDate: z.string().optional().describe('结束日期，格式 YYYYMMDD'),
});

const GlobalFuturesSpotSchema = z.object({
  pageSize: z.number().optional().describe('每页数量，默认 20，会自动分页获取全部'),
});

const GlobalFuturesKlineSchema = z.object({
  symbol: z.string().describe('全球期货代码，如 "HG00Y"（COMEX 铜）'),
  period: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .describe('K 线周期: daily=日线(默认), weekly=周线, monthly=月线'),
  startDate: z.string().optional().describe('开始日期，格式 YYYYMMDD'),
  endDate: z.string().optional().describe('结束日期，格式 YYYYMMDD'),
});

const FuturesInventorySchema = z.object({
  symbol: z.string().describe('库存品种代码（通过 get_futures_inventory_symbols 获取）'),
  startDate: z.string().optional().describe('开始日期，格式 YYYYMMDD'),
  pageSize: z.number().optional().describe('每页数量，默认自动分页获取全部'),
});

const ComexInventorySchema = z.object({
  symbol: z.enum(['gold', 'silver']).describe('品种: gold=黄金, silver=白银'),
  pageSize: z.number().optional().describe('每页数量'),
});

// ==================== Tool 定义 ====================

export const futuresTools: Tool[] = [
  {
    name: 'get_futures_kline',
    description: '获取国内期货历史 K 线数据（日/周/月），包含开高低收、成交量、持仓量等',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '期货代码，如 "rb2605"（螺纹钢）、"RBM"（主力合约）' },
        period: { type: 'string', enum: ['daily', 'weekly', 'monthly'], description: 'K 线周期: daily=日线(默认), weekly=周线, monthly=月线' },
        startDate: { type: 'string', description: '开始日期，格式 YYYYMMDD' },
        endDate: { type: 'string', description: '结束日期，格式 YYYYMMDD' },
      },
      required: ['symbol'],
    },
    annotations: { title: '国内期货 K 线', readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_global_futures_spot',
    description: '获取全球期货实时行情，返回全球主要期货品种（原油、黄金、铜等）的最新报价',
    inputSchema: {
      type: 'object',
      properties: {
        pageSize: { type: 'number', description: '每页数量，默认 20' },
      },
    },
    annotations: { title: '全球期货行情', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_global_futures_kline',
    description: '获取全球期货历史 K 线数据（日/周/月）',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '全球期货代码，如 "HG00Y"（COMEX 铜）' },
        period: { type: 'string', enum: ['daily', 'weekly', 'monthly'], description: 'K 线周期: daily=日线(默认), weekly=周线, monthly=月线' },
        startDate: { type: 'string', description: '开始日期，格式 YYYYMMDD' },
        endDate: { type: 'string', description: '结束日期，格式 YYYYMMDD' },
      },
      required: ['symbol'],
    },
    annotations: { title: '全球期货 K 线', readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_futures_inventory_symbols',
    description: '获取期货仓单/库存品种列表，返回所有可查询库存的品种代码',
    inputSchema: { type: 'object', properties: {} },
    annotations: { title: '期货库存品种', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_futures_inventory',
    description: '获取期货仓单/库存数据，返回指定品种的历史库存变化',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: '库存品种代码（通过 get_futures_inventory_symbols 获取）' },
        startDate: { type: 'string', description: '开始日期，格式 YYYYMMDD' },
        pageSize: { type: 'number', description: '每页数量' },
      },
      required: ['symbol'],
    },
    annotations: { title: '期货库存数据', readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_comex_inventory',
    description: '获取 COMEX 黄金/白银库存数据',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', enum: ['gold', 'silver'], description: '品种: gold=黄金, silver=白银' },
        pageSize: { type: 'number', description: '每页数量' },
      },
      required: ['symbol'],
    },
    annotations: { title: 'COMEX 库存', readOnlyHint: true, openWorldHint: false },
  },
];

// ==================== Handler 实现 ====================

export function createFuturesHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_futures_kline: async (args) => {
      const { symbol, period, startDate, endDate } = FuturesKlineSchema.parse(args);
      const data = await sdk.getFuturesKline(symbol, { period, startDate, endDate });
      return { total: data.length, data };
    },

    get_global_futures_spot: async (args) => {
      const { pageSize } = GlobalFuturesSpotSchema.parse(args);
      const data = await sdk.getGlobalFuturesSpot({ pageSize });
      return { total: data.length, data };
    },

    get_global_futures_kline: async (args) => {
      const { symbol, period, startDate, endDate } = GlobalFuturesKlineSchema.parse(args);
      const data = await sdk.getGlobalFuturesKline(symbol, { period, startDate, endDate });
      return { total: data.length, data };
    },

    get_futures_inventory_symbols: async () => {
      const data = await sdk.getFuturesInventorySymbols();
      return { total: data.length, data };
    },

    get_futures_inventory: async (args) => {
      const { symbol, startDate, pageSize } = FuturesInventorySchema.parse(args);
      const data = await sdk.getFuturesInventory(symbol, { startDate, pageSize });
      return { total: data.length, data };
    },

    get_comex_inventory: async (args) => {
      const { symbol, pageSize } = ComexInventorySchema.parse(args);
      const data = await sdk.getComexInventory(symbol, { pageSize });
      return { total: data.length, data };
    },
  };
}
