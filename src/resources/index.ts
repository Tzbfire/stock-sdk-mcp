/**
 * MCP Resources 定义
 * 提供静态或缓存的数据资源
 */

import type { StockSDK } from 'stock-sdk';

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export type ResourceHandler = () => Promise<string>;

/**
 * 获取所有 Resource 定义
 */
export function getAllResources(): Resource[] {
  return [
    {
      uri: 'stock://calendar/trading',
      name: 'A 股交易日历',
      description: '从 1990 年至今的 A 股交易日期列表，可用于判断某天是否为交易日',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://market/a-share/codes',
      name: 'A 股代码列表',
      description: '全部 A 股股票代码（5000+ 只），包含上证、深证、北证',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://market/hk/codes',
      name: '港股代码列表',
      description: '全部港股股票代码（2000+ 只）',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://market/us/codes',
      name: '美股代码列表',
      description: '全部美股股票代码（8000+ 只），包含纳斯达克和纽交所',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://market/fund/codes',
      name: '基金代码列表',
      description: '全部公募基金代码（26000+ 只）',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://board/industry/list',
      name: '行业板块列表',
      description: '所有行业板块的名称和代码',
      mimeType: 'application/json',
    },
    {
      uri: 'stock://board/concept/list',
      name: '概念板块列表',
      description: '所有概念板块的名称和代码',
      mimeType: 'application/json',
    },
  ];
}

/**
 * 创建所有 Resource Handlers
 */
export function createResourceHandlers(
  sdk: StockSDK
): Record<string, ResourceHandler> {
  return {
    'stock://calendar/trading': async () => {
      const calendar = await sdk.getTradingCalendar();
      return JSON.stringify(
        {
          total: calendar.length,
          startDate: calendar[0],
          endDate: calendar[calendar.length - 1],
          dates: calendar,
        },
        null,
        2
      );
    },

    'stock://market/a-share/codes': async () => {
      const codes = await sdk.getAShareCodeList();
      return JSON.stringify(
        {
          total: codes.length,
          codes,
        },
        null,
        2
      );
    },

    'stock://market/hk/codes': async () => {
      const codes = await sdk.getHKCodeList();
      return JSON.stringify(
        {
          total: codes.length,
          codes,
        },
        null,
        2
      );
    },

    'stock://market/us/codes': async () => {
      const codes = await sdk.getUSCodeList();
      return JSON.stringify(
        {
          total: codes.length,
          codes,
        },
        null,
        2
      );
    },

    'stock://market/fund/codes': async () => {
      const codes = await sdk.getFundCodeList();
      return JSON.stringify(
        {
          total: codes.length,
          codes,
        },
        null,
        2
      );
    },

    'stock://board/industry/list': async () => {
      const list = await sdk.getIndustryList();
      return JSON.stringify(
        {
          total: list.length,
          data: list.map((item) => ({
            name: item.name,
            code: item.code,
            changePercent: item.changePercent,
          })),
        },
        null,
        2
      );
    },

    'stock://board/concept/list': async () => {
      const list = await sdk.getConceptList();
      return JSON.stringify(
        {
          total: list.length,
          data: list.map((item) => ({
            name: item.name,
            code: item.code,
            changePercent: item.changePercent,
          })),
        },
        null,
        2
      );
    },
  };
}
