/**
 * Stock SDK MCP Server 入口
 *
 * 提供股票行情数据的 MCP 接口，支持：
 * - A 股、港股、美股、基金实时行情
 * - 历史 K 线和分钟 K 线
 * - 带技术指标的 K 线数据（MA/MACD/BOLL/KDJ/RSI 等）
 * - 行业板块和概念板块数据
 * - 资金流向、分红详情等扩展数据
 *
 * @example
 * 在 Cursor 中配置 (~/.cursor/mcp.json):
 * {
 *   "mcpServers": {
 *     "stock-sdk": {
 *       "command": "node",
 *       "args": ["/path/to/mcp-server/dist/index.js"]
 *     }
 *   }
 * }
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // 输出到 stderr，避免干扰 stdio 通信
  console.error('🚀 Stock SDK MCP Server is running on stdio');
  console.error('📊 Supported markets: A-Share, HK, US, Fund');
  console.error('📈 Features: Real-time quotes, K-line, Technical indicators, Board data');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
