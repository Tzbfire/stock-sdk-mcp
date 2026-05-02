/**
 * 涨停板 / 盘口异动 Tools
 * 包含涨停池、盘口异动、板块异动
 */

import type { StockSDK } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';

// ==================== Schema 定义 ====================

const ZTPoolSchema = z.object({
  type: z
    .enum(['zt', 'yesterday', 'strong', 'sub_new', 'broken', 'dt'])
    .optional()
    .describe('股池类型: zt=涨停(默认), yesterday=昨日涨停, strong=强势, sub_new=次新, broken=炸板, dt=跌停'),
  date: z
    .string()
    .optional()
    .describe('交易日 YYYYMMDD 或 YYYY-MM-DD（默认今天）'),
});

const StockChangesSchema = z.object({
  type: z
    .enum([
      'rocket_launch', 'quick_rebound', 'large_buy', 'limit_up_seal',
      'limit_down_open', 'big_buy_order', 'auction_up', 'high_open_5d',
      'gap_up', 'high_60d', 'surge_60d',
      'accelerate_down', 'high_dive', 'large_sell', 'limit_down_seal',
      'limit_up_open', 'big_sell_order', 'auction_down', 'low_open_5d',
      'gap_down', 'low_60d', 'drop_60d',
    ])
    .optional()
    .describe(
      '异动类型（默认 large_buy）: ' +
      '看多类 - rocket_launch=火箭发射, quick_rebound=快速反弹, large_buy=大笔买入, limit_up_seal=封涨停板, big_buy_order=大买单, gap_up=向上缺口, high_60d=60日新高, surge_60d=60日大幅上涨; ' +
      '看空类 - accelerate_down=加速下跌, high_dive=高台跳水, large_sell=大笔卖出, limit_down_seal=封跌停板, big_sell_order=大卖单, gap_down=向下缺口, low_60d=60日新低, drop_60d=60日大幅下跌'
    ),
});

// ==================== Tool 定义 ====================

export const hotspotTools: Tool[] = [
  {
    name: 'get_zt_pool',
    description:
      '获取涨停股池数据，支持 6 大股池：涨停、昨日涨停、强势、次新、炸板、跌停。可指定日期查询历史',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['zt', 'yesterday', 'strong', 'sub_new', 'broken', 'dt'],
          description:
            '股池类型: zt=涨停(默认), yesterday=昨日涨停, strong=强势, sub_new=次新, broken=炸板, dt=跌停',
        },
        date: {
          type: 'string',
          description: '交易日 YYYYMMDD 或 YYYY-MM-DD（默认今天）',
        },
      },
    },
    annotations: { title: '涨停股池', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_stock_changes',
    description:
      '获取盘口异动数据，共 22 种异动类型（火箭发射、大笔买入、封涨停、60日新高等），捕捉实时市场信号',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'rocket_launch', 'quick_rebound', 'large_buy', 'limit_up_seal',
            'limit_down_open', 'big_buy_order', 'auction_up', 'high_open_5d',
            'gap_up', 'high_60d', 'surge_60d',
            'accelerate_down', 'high_dive', 'large_sell', 'limit_down_seal',
            'limit_up_open', 'big_sell_order', 'auction_down', 'low_open_5d',
            'gap_down', 'low_60d', 'drop_60d',
          ],
          description: '异动类型，默认 large_buy（大笔买入）',
        },
      },
    },
    annotations: { title: '盘口异动', readOnlyHint: true, openWorldHint: true },
  },
  {
    name: 'get_board_changes',
    description: '获取当日板块异动详情，返回板块级别的异动汇总（急涨、急跌等）',
    inputSchema: { type: 'object', properties: {} },
    annotations: { title: '板块异动', readOnlyHint: true, openWorldHint: true },
  },
];

// ==================== Handler 实现 ====================

export function createHotspotHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_zt_pool: async (args) => {
      const { type, date } = ZTPoolSchema.parse(args);
      const data = await sdk.getZTPool(type ?? 'zt', date);
      return { total: data.length, data };
    },

    get_stock_changes: async (args) => {
      const { type } = StockChangesSchema.parse(args);
      const data = await sdk.getStockChanges(type ?? 'large_buy');
      return { total: data.length, data };
    },

    get_board_changes: async () => {
      const data = await sdk.getBoardChanges();
      return { total: data.length, data };
    },
  };
}
