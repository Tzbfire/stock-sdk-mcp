/**
 * Tools 统一导出
 */

import type { StockSDK } from 'stock-sdk';
import type { Tool, ToolHandler } from './types.js';

// 导入所有 Tools 定义
import { quoteTools, createQuoteHandlers } from './quotes.js';
import { klineTools, createKlineHandlers } from './kline.js';
import { searchTools, createSearchHandlers } from './search.js';
import { batchTools, createBatchHandlers } from './batch.js';
import { boardTools, createBoardHandlers } from './board.js';
import { extendedTools, createExtendedHandlers } from './extended.js';

export type { Tool, ToolHandler } from './types.js';

/**
 * 获取所有 Tool 定义
 */
export function getAllTools(): Tool[] {
  return [
    ...quoteTools,
    ...klineTools,
    ...searchTools,
    ...batchTools,
    ...boardTools,
    ...extendedTools,
  ];
}

/**
 * 创建所有 Tool Handlers
 */
export function createAllHandlers(sdk: StockSDK): Record<string, ToolHandler> {
  return {
    ...createQuoteHandlers(sdk),
    ...createKlineHandlers(sdk),
    ...createSearchHandlers(sdk),
    ...createBatchHandlers(sdk),
    ...createBoardHandlers(sdk),
    ...createExtendedHandlers(sdk),
  };
}
