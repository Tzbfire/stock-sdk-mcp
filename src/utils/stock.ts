import type { StockSDK, SearchResult } from 'stock-sdk';

/**
 * 判断是否为股票代码
 * 简单规则：6位数字，或者包含 sh/sz/hk 开头，或者美股常见字母形式
 */
export function isStockCode(str: string): boolean {
  // A股 6位数字
  if (/^\d{6}$/.test(str)) return true;
  // 带前缀的代码 sh000001, sz000858, hk00700, usAAPL
  if (/^(sh|sz|hk|us|bj)[a-zA-Z0-9]+$/i.test(str)) return true;
  // 美股代码（纯字母且长度 1-5）
  if (/^[a-zA-Z]{1,5}$/.test(str)) return true;
  return false;
}

/**
 * 将模糊查询（名称/拼音/代码）转换为确定的股票代码
 */
export async function resolveStockCodes(
  sdk: StockSDK,
  queries: string[]
): Promise<{ code: string; name: string; market: string }[]> {
  const results: { code: string; name: string; market: string }[] = [];

  for (const query of queries) {
    if (isStockCode(query)) {
      // 如果代码里没有前缀且是 6 位数字，默认为 A 股，但这需要知道它是 sh 还是 sz
      // 为了准确，这种情况也建议走一遍搜索，或者由 SDK 的 getFullQuotes 处理（它会自动识别）
      // 这里我们为了简单，如果是代码且不带市场前缀，我们还是搜一下比较稳，或者直接当做 query 传给 getFullQuotes

      // 如果已经带有明显的市场前缀或者是纯美股代码，直接记录
      if (/^(sh|sz|hk|us|bj)/i.test(query) || /^[a-zA-Z]{1,5}$/.test(query)) {
        results.push({ code: query, name: query, market: 'unknown' });
        continue;
      }

      // 6 位纯数字，搜一下确定市场
      if (/^\d{6}$/.test(query)) {
        const searchRes = await sdk.search(query);
        if (searchRes && searchRes.length > 0) {
          // 找到最匹配的一个
          const best = searchRes.find((s: SearchResult) => s.code.endsWith(query)) || searchRes[0];
          results.push({ code: best.code, name: best.name, market: best.market });
          continue;
        }
      }

      // 其他情况直接加入
      results.push({ code: query, name: query, market: 'unknown' });
    } else {
      // 显然是名称或拼音
      const searchRes = await sdk.search(query);
      if (searchRes && searchRes.length > 0) {
        // 名字完全一致优先
        const best = (searchRes as SearchResult[]).find((s: SearchResult) => s.name === query) || searchRes[0];
        results.push({ code: best.code, name: best.name, market: best.market });
      }
    }
  }

  return results;
}
