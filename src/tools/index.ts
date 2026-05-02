/**
 * Tools 统一导出
 */

import type { StockSDK } from 'stock-sdk';
import type { Tool, ToolHandler } from './types.js';

import { quoteTools, createQuoteHandlers } from './quotes.js';
import { klineTools, createKlineHandlers } from './kline.js';
import { searchTools, createSearchHandlers } from './search.js';
import { batchTools, createBatchHandlers } from './batch.js';
import { boardTools, createBoardHandlers } from './board.js';
import { extendedTools, createExtendedHandlers } from './extended.js';
import { futuresTools, createFuturesHandlers } from './futures.js';
import { optionsTools, createOptionsHandlers } from './options.js';
import { compoundTools, createCompoundHandlers } from './compound.js';
import { fundflowTools, createFundflowHandlers } from './fundflow.js';
import { northboundTools, createNorthboundHandlers } from './northbound.js';
import { hotspotTools, createHotspotHandlers } from './hotspot.js';
import { dragontigerTools, createDragontigerHandlers } from './dragontiger.js';
import { marginTools, createMarginHandlers } from './margin.js';

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
    ...futuresTools,
    ...optionsTools,
    ...compoundTools,
    ...fundflowTools,
    ...northboundTools,
    ...hotspotTools,
    ...dragontigerTools,
    ...marginTools,
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
    ...createFuturesHandlers(sdk),
    ...createOptionsHandlers(sdk),
    ...createCompoundHandlers(sdk),
    ...createFundflowHandlers(sdk),
    ...createNorthboundHandlers(sdk),
    ...createHotspotHandlers(sdk),
    ...createDragontigerHandlers(sdk),
    ...createMarginHandlers(sdk),
  };
}
