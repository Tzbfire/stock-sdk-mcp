/**
 * 板块数据相关 Tools
 * 包含行业板块和概念板块的列表、行情、成分股、K 线
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const BoardSymbolSchema = z.object({
  symbol: z.string().describe('板块名称（如"小金属"、"人工智能"）或代码（如"BK1027"、"BK0800"）'),
});

const BoardKlineSchema = z.object({
  symbol: z.string().describe('板块名称或代码'),
  period: z.enum(['daily', 'weekly', 'monthly']).optional().describe('K 线周期: daily=日线, weekly=周线, monthly=月线'),
  startDate: z.string().optional().describe('开始日期，格式 YYYYMMDD'),
  endDate: z.string().optional().describe('结束日期，格式 YYYYMMDD'),
});

// ==================== Tool 定义 ====================

export const boardTools: Tool[] = [
  // ==================== 行业板块 ====================
  {
    name: 'get_industry_list',
    description: '获取行业板块名称列表，返回所有行业板块的名称、代码、涨跌幅、领涨股等信息',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_industry_spot',
    description: '获取行业板块实时行情，返回板块的详细指标',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '行业板块名称（如"小金属"）或代码（如"BK1027"）',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_industry_constituents',
    description: '获取行业板块成分股列表，返回板块内所有股票的实时行情',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '行业板块名称（如"小金属"）或代码（如"BK1027"）',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_industry_kline',
    description: '获取行业板块历史 K 线数据（日/周/月）',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '行业板块名称或代码',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'K 线周期: daily=日线(默认), weekly=周线, monthly=月线',
        },
        startDate: {
          type: 'string',
          description: '开始日期，格式 YYYYMMDD',
        },
        endDate: {
          type: 'string',
          description: '结束日期，格式 YYYYMMDD',
        },
      },
      required: ['symbol'],
    },
  },
  // ==================== 概念板块 ====================
  {
    name: 'get_concept_list',
    description: '获取概念板块名称列表，返回所有概念板块的名称、代码、涨跌幅、领涨股等信息',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_concept_spot',
    description: '获取概念板块实时行情，返回板块的详细指标',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '概念板块名称（如"人工智能"）或代码（如"BK0800"）',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_concept_constituents',
    description: '获取概念板块成分股列表，返回板块内所有股票的实时行情',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '概念板块名称（如"人工智能"）或代码（如"BK0800"）',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_concept_kline',
    description: '获取概念板块历史 K 线数据（日/周/月）',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '概念板块名称或代码',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'K 线周期: daily=日线(默认), weekly=周线, monthly=月线',
        },
        startDate: {
          type: 'string',
          description: '开始日期，格式 YYYYMMDD',
        },
        endDate: {
          type: 'string',
          description: '结束日期，格式 YYYYMMDD',
        },
      },
      required: ['symbol'],
    },
  },
];

// ==================== Handler 实现 ====================

export function createBoardHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    // ==================== 行业板块 ====================
    get_industry_list: async () => {
      const list = await sdk.getIndustryList();
      return {
        total: list.length,
        data: list,
      };
    },

    get_industry_spot: async (args) => {
      const { symbol } = BoardSymbolSchema.parse(args);
      return await sdk.getIndustrySpot(symbol);
    },

    get_industry_constituents: async (args) => {
      const { symbol } = BoardSymbolSchema.parse(args);
      const constituents = await sdk.getIndustryConstituents(symbol);
      return {
        total: constituents.length,
        data: constituents,
      };
    },

    get_industry_kline: async (args) => {
      const { symbol, period, startDate, endDate } = BoardKlineSchema.parse(args);
      return await sdk.getIndustryKline(symbol, {
        period,
        startDate,
        endDate,
      });
    },

    // ==================== 概念板块 ====================
    get_concept_list: async () => {
      const list = await sdk.getConceptList();
      return {
        total: list.length,
        data: list,
      };
    },

    get_concept_spot: async (args) => {
      const { symbol } = BoardSymbolSchema.parse(args);
      return await sdk.getConceptSpot(symbol);
    },

    get_concept_constituents: async (args) => {
      const { symbol } = BoardSymbolSchema.parse(args);
      const constituents = await sdk.getConceptConstituents(symbol);
      return {
        total: constituents.length,
        data: constituents,
      };
    },

    get_concept_kline: async (args) => {
      const { symbol, period, startDate, endDate } = BoardKlineSchema.parse(args);
      return await sdk.getConceptKline(symbol, {
        period,
        startDate,
        endDate,
      });
    },
  };
}
