/**
 * MCP Prompts 定义
 * 将 Skills 工作流注册为 MCP 原生 Prompts，所有 MCP Client 均可调用
 */

interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

interface Prompt {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

interface PromptMessage {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string };
}

interface GetPromptResult {
  description?: string;
  messages: PromptMessage[];
}

type PromptHandler = (args: Record<string, string>) => GetPromptResult;

/**
 * 获取所有 Prompt 定义
 */
export function getAllPrompts(): Prompt[] {
  return [
    {
      name: 'stock-analyst',
      description: '个股技术分析专家：深度分析 K 线形态、技术指标、资金流向与北向持仓，给出综合建议',
      arguments: [
        { name: 'symbol', description: '股票名称或代码，如 "茅台"、"600519"、"AAPL"', required: true },
        { name: 'period', description: 'K 线周期: daily/weekly/monthly，默认 daily', required: false },
      ],
    },
    {
      name: 'stock-screener',
      description: '智能选股器：按策略条件筛选全市场标的，如涨幅、市盈率、量比等',
      arguments: [
        { name: 'market', description: '市场范围: all/sh/sz/kc/cy，默认 all', required: false },
        { name: 'conditions', description: '筛选条件自然语言描述，如 "涨幅 > 5%，市盈率 < 30"', required: true },
      ],
    },
    {
      name: 'market-overview',
      description: '大盘全景概览：快速把握指数、行业/概念热点、市场情绪',
      arguments: [
        { name: 'scope', description: '分析范围: brief=简报/detailed=详细，默认 brief', required: false },
      ],
    },
    {
      name: 'realtime-monitor',
      description: '自选股实时监控：持续跟踪持仓股票的行情和损益',
      arguments: [
        { name: 'stocks', description: '自选股列表，用逗号分隔，如 "茅台,腾讯,苹果"', required: true },
        { name: 'costs', description: '对应的买入成本，用逗号分隔，如 "1800,350,180"', required: false },
      ],
    },
    {
      name: 'smart-money-tracker',
      description: '聪明钱追踪师：综合北向资金、龙虎榜机构、大宗交易、资金流排名，追踪主力资金动向',
      arguments: [
        { name: 'focus', description: '关注重点: all=全面扫描(默认), northbound=北向资金, institution=机构动向, block_trade=大宗交易', required: false },
      ],
    },
    {
      name: 'futures-overview',
      description: '期货市场概览：全球期货行情速览和国内期货分析',
      arguments: [
        { name: 'scope', description: '范围: global=全球期货/domestic=国内期货/all=全部，默认 all', required: false },
      ],
    },
  ];
}

/**
 * 创建所有 Prompt Handlers
 */
export function createPromptHandlers(): Record<string, PromptHandler> {
  return {
    'stock-analyst': (args) => {
      const symbol = args.symbol || '600519';
      const period = args.period || 'daily';
      return {
        description: `对 ${symbol} 进行深度技术分析`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一位专业的股票技术分析师。请对 "${symbol}" 进行全面的技术分析。

请按以下步骤操作：

1. **全景数据获取**：使用 analyze_stock 工具获取 "${symbol}" 的全景数据（K 线指标 + 资金流 + 资金流历史 + 北向持仓 + 分红），周期为 ${period}
2. **技术分析**：基于 K 线和指标数据，分析：
   - 趋势判断：均线排列方向，价格与均线的关系
   - MACD 信号：金叉/死叉，柱状图变化趋势
   - KDJ 信号：超买/超卖区域，交叉信号
   - RSI 信号：是否处于超买(>70)/超卖(<30)区域
   - 布林带：价格在通道中的位置，带宽变化
   - 支撑位与压力位
3. **资金面分析**：
   - 主力资金流入/流出趋势（近期是否持续流入）
   - 北向资金持仓变化（外资是否在加仓）
4. **综合研判**：结合技术面和资金面，给出综合分析结论和操作建议

请以 Markdown 表格和清晰的结构化格式输出分析结果。
⚠️ 免责声明：以上分析仅供参考，不构成投资建议。`,
            },
          },
        ],
      };
    },

    'stock-screener': (args) => {
      const market = args.market || 'all';
      const conditions = args.conditions || '涨幅大于 3%';
      return {
        description: `在 ${market} 市场中按条件筛选股票`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一个智能选股助手。请根据以下条件在 A 股市场中筛选标的：

**市场范围**：${market === 'all' ? '全部 A 股' : market}
**筛选条件**：${conditions}

请按以下步骤操作：

1. **理解条件**：将自然语言条件解析为具体的数值过滤参数
2. **获取数据**：使用 scan_market 工具进行条件筛选，设置合适的参数：
   - minChange/maxChange：涨跌幅范围
   - minVolume：最低成交量
   - minTurnover：最低换手率
   - minPE/maxPE：市盈率范围
   - sortBy/sortOrder：排序方式
3. **结果展示**：以 Markdown 表格展示筛选结果，包含股票代码、名称、最新价、涨跌幅等关键字段
4. **简要点评**：对筛选结果做简要总结

如果条件不完整，请主动补充合理的默认值。`,
            },
          },
        ],
      };
    },

    'market-overview': (args) => {
      const scope = args.scope || 'brief';
      return {
        description: '大盘全景概览',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一位市场分析师。请给出当前 A 股市场的${scope === 'detailed' ? '详细' : ''}全景概览。

请按以下步骤操作：

1. **获取大盘数据**：使用 get_market_overview 工具获取大盘概览（已包含指数、行业/概念 TOP10、北向资金、涨停/跌停家数、板块异动）
2. **指数解读**：分析上证指数、深证成指、创业板指等主要指数的表现
3. **北向资金**：解读北向资金流入/流出情况及其信号意义
4. **行业热点**：分析领涨和领跌的行业板块
5. **概念热点**：分析当前活跃的概念板块
6. **市场温度**：综合涨停/跌停家数、板块异动、北向资金判断市场情绪
${scope === 'detailed' ? '7. **详细分析**：对领涨行业的龙头股使用 get_sector_analysis 做深度分析' : ''}

请以清晰的结构化格式输出，适合快速阅读。`,
            },
          },
        ],
      };
    },

    'realtime-monitor': (args) => {
      const stocks = args.stocks || '茅台,腾讯';
      const costs = args.costs || '';
      return {
        description: `监控自选股：${stocks}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一个自选股监控助手。请帮我查看以下股票的实时行情：

**自选股列表**：${stocks}
${costs ? `**买入成本**：${costs}（与自选股一一对应）` : ''}

请按以下步骤操作：

1. **获取行情**：使用 get_quotes_by_query 工具查询所有自选股的实时行情
2. **行情展示**：以 Markdown 表格展示：股票名称、最新价、涨跌幅、成交量、成交额
${costs ? '3. **损益计算**：根据买入成本计算每只股票的浮动盈亏比例' : ''}
${costs ? '4. **持仓总结**：汇总持仓整体盈亏情况' : '3. **异动提示**：标注涨跌幅超过 3% 的异动股票'}

请以清晰的表格格式输出。`,
            },
          },
        ],
      };
    },

    'smart-money-tracker': (args) => {
      const focus = args.focus || 'all';
      const sections = {
        northbound: focus === 'all' || focus === 'northbound',
        institution: focus === 'all' || focus === 'institution',
        blockTrade: focus === 'all' || focus === 'block_trade',
      };
      return {
        description: '聪明钱动向追踪',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一位专注于资金流分析的投资研究员。请追踪当前市场中"聪明钱"（北向资金、机构、游资）的最新动向。

请按以下步骤操作：
${sections.northbound ? `
**一、北向资金动向**
1. 使用 get_northbound_realtime 获取今日北向资金分时和汇总
2. 使用 get_northbound_holding_rank 获取北向持股变动排行（5日维度）
3. 分析：北向今日净流入/流出多少？重点加仓了哪些个股？` : ''}
${sections.institution ? `
**${sections.northbound ? '二' : '一'}、龙虎榜机构动向**
1. 使用 get_dragon_tiger_stats(type: "institution") 获取近期机构买卖统计（需提供近 5 个交易日的日期范围）
2. 使用 get_dragon_tiger_stats(type: "stock_stats") 获取个股上榜频次统计
3. 分析：机构近期在集中买入哪些标的？是否有一致性方向？` : ''}
${sections.blockTrade ? `
**${sections.northbound && sections.institution ? '三' : sections.northbound || sections.institution ? '二' : '一'}、大宗交易与融资融券**
1. 使用 get_block_trade(type: "overview") 获取大宗交易市场总览
2. 使用 get_margin_data(type: "account") 获取融资融券账户统计
3. 分析：大宗交易溢价/折价趋势、两融余额变化（市场杠杆情绪）` : ''}

**${focus === 'all' ? '四' : '二'}、资金流向验证**
1. 使用 get_fund_flow_rank(scope: "stock") 获取个股主力资金流排名
2. 使用 get_fund_flow_rank(scope: "sector", sectorType: "industry") 获取行业资金流排名
3. 使用 get_market_fund_flow 获取大盘资金流趋势

**最终研判**
- 交叉验证：北向、机构、游资方向是否共振
- 输出：聪明钱一致看好/看空的板块和个股
- 给出关注建议和风险提示

⚠️ 免责声明：以上分析仅供参考，不构成投资建议。`,
            },
          },
        ],
      };
    },

    'futures-overview': (args) => {
      const scope = args.scope || 'all';
      return {
        description: '期货市场概览',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `你是一位期货市场分析师。请给出${scope === 'global' ? '全球' : scope === 'domestic' ? '国内' : '全球和国内'}期货市场的行情概览。

请按以下步骤操作：

${scope !== 'domestic' ? '1. **全球期货**：使用 get_global_futures_spot 工具获取全球主要期货品种的实时行情\n   - 分类展示：贵金属（黄金、白银）、能源（原油、天然气）、基本金属（铜、铝）、农产品等\n' : ''}
${scope !== 'global' ? `${scope !== 'domestic' ? '2' : '1'}. **国内期货**：选择几个代表性的主力合约（如螺纹钢 RBM、铁矿石 IM 等），使用 get_futures_kline 获取近期走势\n` : ''}
${scope !== 'domestic' ? `${scope === 'all' ? '3' : '2'}. **COMEX 库存**：使用 get_comex_inventory 查看黄金和白银的库存变化趋势\n` : ''}

请以 Markdown 表格和简要点评的形式输出。`,
            },
          },
        ],
      };
    },
  };
}
