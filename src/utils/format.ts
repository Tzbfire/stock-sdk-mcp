/**
 * 数据格式化工具
 */

/**
 * 将数据格式化为 MCP 响应内容
 */
export function formatResponse(data: unknown): { type: 'text'; text: string }[] {
  return [
    {
      type: 'text',
      text: JSON.stringify(data, null, 2),
    },
  ];
}

/**
 * 格式化错误响应
 */
export function formatError(error: unknown): { type: 'text'; text: string }[] {
  const message = error instanceof Error ? error.message : String(error);
  return [
    {
      type: 'text',
      text: `Error: ${message}`,
    },
  ];
}

/**
 * 解析逗号分隔的字符串为数组
 */
export function parseCodesString(codes: string | string[]): string[] {
  if (Array.isArray(codes)) {
    return codes.map((c) => c.trim()).filter(Boolean);
  }
  return codes
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}
