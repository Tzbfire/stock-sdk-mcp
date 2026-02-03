/**
 * 实时行情相关 Tools
 * 包含 A 股、港股、美股、基金的实时行情查询
 * 以及全市场行情批量查询（重要功能）
 */

import type { StockSDK, FullQuote, HKQuote, USQuote } from 'stock-sdk';
import { z } from 'zod';
import type { Tool, ToolHandler } from './types.js';
import { resolveStockCodes } from '../utils/stock.js';

// ==================== Schema 定义 ====================

const GetAShareQuotesSchema = z.object({
  codes: z
    .array(z.string())
    .describe('A 股代码数组，如 ["sh600519", "sz000858"]'),
});

const GetHKQuotesSchema = z.object({
  codes: z.array(z.string()).describe('港股代码数组，如 ["00700", "09988"]'),
});

const GetUSQuotesSchema = z.object({
  codes: z.array(z.string()).describe('美股代码数组，如 ["AAPL", "BABA"]'),
});

const GetFundQuotesSchema = z.object({
  codes: z.array(z.string()).describe('基金代码数组，如 ["000001", "110011"]'),
});

const GetQuotesByQuerySchema = z.object({
  queries: z
    .array(z.string())
    .describe('股票名称、代码或拼音数组，如 ["茅台", "00700", "AAPL"]'),
});

const GetAllAShareQuotesSchema = z.object({
  market: z
    .enum(['all', 'sh', 'sz', 'bj', 'kc', 'cy'])
    .optional()
    .describe(
      '市场筛选: all=全部, sh=上证, sz=深证, bj=北证, kc=科创板, cy=创业板'
    ),
  batchSize: z
    .number()
    .optional()
    .default(500)
    .describe('每批请求的股票数量，默认 500'),
  concurrency: z
    .number()
    .optional()
    .default(7)
    .describe('并发请求数，默认 7'),
});

const GetAllHKQuotesSchema = z.object({
  batchSize: z
    .number()
    .optional()
    .default(300)
    .describe('每批请求的股票数量，默认 300'),
  concurrency: z
    .number()
    .optional()
    .default(5)
    .describe('并发请求数，默认 5'),
});

const GetAllUSQuotesSchema = z.object({
  market: z
    .enum(['all', 'NASDAQ', 'NYSE'])
    .optional()
    .describe('市场筛选: all=全部, NASDAQ=纳斯达克, NYSE=纽交所'),
  batchSize: z
    .number()
    .optional()
    .default(300)
    .describe('每批请求的股票数量，默认 300'),
  concurrency: z
    .number()
    .optional()
    .default(5)
    .describe('并发请求数，默认 5'),
});

// ==================== Tool 定义 ====================

export const quoteTools: Tool[] = [
  {
    name: 'get_a_share_quotes',
    description:
      '获取 A 股/指数实时行情，返回最新价、涨跌幅、成交量、市盈率、市净率等 40+ 字段的完整信息',
    inputSchema: {
      type: 'object',
      properties: {
        codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'A 股代码数组，如 ["sh600519", "sz000858"]',
        },
      },
      required: ['codes'],
    },
  },
  {
    name: 'get_hk_quotes',
    description: '获取港股实时行情，返回最新价、涨跌幅、成交量等信息',
    inputSchema: {
      type: 'object',
      properties: {
        codes: {
          type: 'array',
          items: { type: 'string' },
          description: '港股代码数组，如 ["00700", "09988"]',
        },
      },
      required: ['codes'],
    },
  },
  {
    name: 'get_us_quotes',
    description: '获取美股实时行情，返回最新价、涨跌幅、成交量等信息',
    inputSchema: {
      type: 'object',
      properties: {
        codes: {
          type: 'array',
          items: { type: 'string' },
          description: '美股代码数组，如 ["AAPL", "BABA"]',
        },
      },
      required: ['codes'],
    },
  },
  {
    name: 'get_fund_quotes',
    description: '获取公募基金实时行情，返回最新净值、累计净值、涨跌额等信息',
    inputSchema: {
      type: 'object',
      properties: {
        codes: {
          type: 'array',
          items: { type: 'string' },
          description: '基金代码数组，如 ["000001", "110011"]',
        },
      },
      required: ['codes'],
    },
  },
  {
    name: 'get_quotes_by_query',
    description:
      '【推荐】通用行情查询工具，支持按名称、代码或拼音模糊查询，自动识别市场（A股/港股/美股）并返回实时行情。如果你只知道股票名字，请优先使用此工具',
    inputSchema: {
      type: 'object',
      properties: {
        queries: {
          type: 'array',
          items: { type: 'string' },
          description: '股票名称、代码或拼音数组，如 ["茅台", "腾讯", "AAPL"]',
        },
      },
      required: ['queries'],
    },
  },
  // ==================== 重要：全市场行情 ====================
  {
    name: 'get_all_a_share_quotes',
    description:
      '【重要】获取全市场 A 股实时行情（5000+ 只股票），支持按市场筛选（上证/深证/北证/科创板/创业板），内置并发控制。注意：数据量较大，请谨慎使用',
    inputSchema: {
      type: 'object',
      properties: {
        market: {
          type: 'string',
          enum: ['all', 'sh', 'sz', 'bj', 'kc', 'cy'],
          description:
            '市场筛选: all=全部(默认), sh=上证, sz=深证, bj=北证, kc=科创板, cy=创业板',
        },
        batchSize: {
          type: 'number',
          description: '每批请求的股票数量，默认 500',
        },
        concurrency: {
          type: 'number',
          description: '并发请求数，默认 7',
        },
      },
    },
  },
  {
    name: 'get_all_hk_quotes',
    description:
      '【重要】获取全市场港股实时行情（2000+ 只股票），内置并发控制。注意：数据量较大，请谨慎使用',
    inputSchema: {
      type: 'object',
      properties: {
        batchSize: {
          type: 'number',
          description: '每批请求的股票数量，默认 300',
        },
        concurrency: {
          type: 'number',
          description: '并发请求数，默认 5',
        },
      },
    },
  },
  {
    name: 'get_all_us_quotes',
    description:
      '【重要】获取全市场美股实时行情（8000+ 只股票），支持按市场筛选（纳斯达克/纽交所），内置并发控制。注意：数据量较大，请谨慎使用',
    inputSchema: {
      type: 'object',
      properties: {
        market: {
          type: 'string',
          enum: ['all', 'NASDAQ', 'NYSE'],
          description: '市场筛选: all=全部(默认), NASDAQ=纳斯达克, NYSE=纽交所',
        },
        batchSize: {
          type: 'number',
          description: '每批请求的股票数量，默认 300',
        },
        concurrency: {
          type: 'number',
          description: '并发请求数，默认 5',
        },
      },
    },
  },
];

// ==================== Handler 实现 ====================

export function createQuoteHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    get_a_share_quotes: async (args) => {
      const { codes } = GetAShareQuotesSchema.parse(args);
      return await sdk.getFullQuotes(codes);
    },

    get_hk_quotes: async (args) => {
      const { codes } = GetHKQuotesSchema.parse(args);
      return await sdk.getHKQuotes(codes);
    },

    get_us_quotes: async (args) => {
      const { codes } = GetUSQuotesSchema.parse(args);
      return await sdk.getUSQuotes(codes);
    },

    get_fund_quotes: async (args) => {
      const { codes } = GetFundQuotesSchema.parse(args);
      return await sdk.getFundQuotes(codes);
    },

    get_quotes_by_query: async (args) => {
      const { queries } = GetQuotesByQuerySchema.parse(args);
      const resolved = await resolveStockCodes(sdk, queries);

      if (resolved.length === 0) {
        return { message: '未找到匹配的股票', results: [] };
      }

      // 按市场分组
      const aShareCodes: string[] = [];
      const hkCodes: string[] = [];
      const usCodes: string[] = [];

      resolved.forEach((res) => {
        const market = res.market.toLowerCase();
        if (market === 'sh' || market === 'sz' || market === 'bj') {
          aShareCodes.push(res.code);
        } else if (market === 'hk') {
          hkCodes.push(res.code);
        } else if (market === 'us') {
          usCodes.push(res.code);
        } else {
          // 如果 market 是 unknown，尝试根据前缀进一步判断
          if (/^(sh|sz|bj)/i.test(res.code)) {
            aShareCodes.push(res.code);
          } else if (/^hk/i.test(res.code)) {
            hkCodes.push(res.code);
          } else if (/^us/i.test(res.code)) {
            usCodes.push(res.code);
          } else if (/^\d{6}$/.test(res.code)) {
            // 无前缀 6 位数字默认当 A 股
            aShareCodes.push(res.code);
          } else if (/^[a-zA-Z]{1,5}$/.test(res.code)) {
            usCodes.push(res.code);
          } else if (/^\d{5}$/.test(res.code)) {
            hkCodes.push(res.code);
          }
        }
      });

      // 并行请求
      const [aQuotes, hkQuotes, usQuotes] = await Promise.all([
        aShareCodes.length > 0 ? sdk.getFullQuotes(aShareCodes) : Promise.resolve([]),
        hkCodes.length > 0 ? sdk.getHKQuotes(hkCodes) : Promise.resolve([]),
        usCodes.length > 0 ? sdk.getUSQuotes(usCodes) : Promise.resolve([]),
      ]);

      return {
        count: resolved.length,
        results: [
          ...aQuotes.map((q: FullQuote) => ({ market: 'A-Share', ...q })),
          ...hkQuotes.map((q: HKQuote) => ({ market: 'HK', ...q })),
          ...usQuotes.map((q: USQuote) => ({ market: 'US', ...q })),
        ],
      };
    },

    // ==================== 重要：全市场行情 ====================
    get_all_a_share_quotes: async (args) => {
      const { market, batchSize, concurrency } =
        GetAllAShareQuotesSchema.parse(args);
      const options: Parameters<typeof sdk.getAllAShareQuotes>[0] = {
        batchSize: batchSize ?? 500,
        concurrency: concurrency ?? 7,
      };
      if (market && market !== 'all') {
        options.market = market as 'sh' | 'sz' | 'bj' | 'kc' | 'cy';
      }
      const quotes = await sdk.getAllAShareQuotes(options);
      return {
        total: quotes.length,
        data: quotes,
      };
    },

    get_all_hk_quotes: async (args) => {
      const { batchSize, concurrency } = GetAllHKQuotesSchema.parse(args);
      const quotes = await sdk.getAllHKShareQuotes({
        batchSize: batchSize ?? 300,
        concurrency: concurrency ?? 5,
      });
      return {
        total: quotes.length,
        data: quotes,
      };
    },

    get_all_us_quotes: async (args) => {
      const { market, batchSize, concurrency } =
        GetAllUSQuotesSchema.parse(args);
      const options: Parameters<typeof sdk.getAllUSShareQuotes>[0] = {
        batchSize: batchSize ?? 300,
        concurrency: concurrency ?? 5,
      };
      if (market && market !== 'all') {
        options.market = market as 'NASDAQ' | 'NYSE';
      }
      const quotes = await sdk.getAllUSShareQuotes(options);
      return {
        total: quotes.length,
        data: quotes,
      };
    },
  };
}
