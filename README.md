# Stock SDK MCP Server

<p align="center">
  <img src="https://img.shields.io/npm/v/stock-sdk-mcp" alt="npm version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="node version">
  <img src="https://img.shields.io/badge/OpenClaw-Compatible-orange" alt="OpenClaw Compatible">
  <img src="https://img.shields.io/badge/protocol-MCP-blue" alt="MCP Protocol">
  <img src="https://img.shields.io/badge/license-ISC-green" alt="license">
</p>

> 🎯 **为 [OpenClaw](https://github.com/anthropics/clawdbot) 生态研发的股票行情 MCP Server**

基于 [stock-sdk](https://www.npmjs.com/package/stock-sdk) 构建的 **MCP (Model Context Protocol) Server**，为 AI 编程助手提供**实时股票行情数据能力**。

同时兼容 **Cursor**、**Claude Desktop**、**Antigravity（Gemini Pro）**、**Codex CLI**、**Gemini CLI** 等主流 AI 工具。

## ✨ 特性

| 特性 | 描述 |
|------|------|
| 🌐 **多市场支持** | A 股（含沪深北、科创/创业板）、港股、美股（纳斯达克/纽交所）、公募基金 |
| 📊 **实时行情** | 获取最新价、涨跌幅、成交量、五档盘口、市盈率等 40+ 字段 |
| 📈 **K 线数据** | 日/周/月 K 线，以及 1/5/15/30/60 分钟级别 K 线 |
| 🧮 **技术指标** | 内置 MA/MACD/BOLL/KDJ/RSI/WR/BIAS/CCI/ATR 等常用指标计算 |
| 🏷️ **板块数据** | 行业板块、概念板块的行情和成分股查询 |
| 💰 **扩展功能** | 资金流向、分红详情、交易日历等 |
| 🚀 **批量查询** | 全市场行情一次性获取（5000+ A 股、2000+ 港股、8000+ 美股） |

## 📦 安装方式

### 方式一：npx 直接运行（推荐）

无需安装，在配置文件中直接使用 `npx`：

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

### 方式二：全局安装

```bash
npm install -g stock-sdk-mcp
```

安装后可直接运行 `stock-mcp` 命令。

### 方式三：本地开发安装

```bash
git clone https://github.com/chengzuopeng/stock-sdk-mcp.git
cd stock-sdk-mcp
yarn install
yarn build
```

或使用一键安装脚本：

```bash
./install.sh
```

---

## 🔧 AI 工具配置指南

### OpenClaw（推荐）

> 🎯 本项目专为 OpenClaw 生态设计，提供开箱即用的股票行情数据能力。

[OpenClaw](https://github.com/anthropics/clawdbot) 是一个开源的 MCP 网关，支持将多个 MCP Server 聚合为统一服务，可通过 HTTP API 在任意应用中调用。

#### 1. 在 OpenClaw 配置中注册此 MCP Server

编辑 `~/.clawdbot/config.yaml`：

```yaml
servers:
  stock-sdk:
    command: npx
    args:
      - "-y"
      - "stock-sdk-mcp"
    description: "股票行情数据服务 - 支持 A股/港股/美股实时行情和技术分析"
    tags:
      - finance
      - stock
      - market-data
```

#### 2. 启动 OpenClaw 网关

```bash
clawdbot gateway start
```

#### 3. 通过 HTTP API 调用

```bash
# 查询股票实时行情
curl -X POST http://localhost:8080/v1/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "server": "stock-sdk",
    "tool": "get_quotes_by_query",
    "arguments": {
      "queries": ["茅台", "腾讯"]
    }
  }'

# 获取带技术指标的 K 线
curl -X POST http://localhost:8080/v1/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "server": "stock-sdk",
    "tool": "get_kline_with_indicators",
    "arguments": {
      "symbol": "600519",
      "indicators": {"ma": {"periods": [5, 10, 20]}, "macd": true}
    }
  }'
```

这样，你可以在任何支持 HTTP 调用的应用中使用股票数据能力。

---

### Cursor IDE

配置文件路径：`~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

配置完成后，重启 Cursor 即可在对话中使用股票查询能力。

---

### Claude Desktop

配置文件路径：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

---

### Antigravity（Gemini Pro in VS Code）

Antigravity 是 Google 推出的 VS Code AI 编程助手，支持 MCP 协议。

配置文件路径：`~/.antigravity/mcp.json`（或在 VS Code 设置中搜索 `antigravity.mcp`）

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

配置后，你可以在 Antigravity 对话框中直接询问：

```
查询一下腾讯控股今天的股价
帮我分析茅台最近的 MACD 走势
```

---

### Codex CLI（OpenAI）

[Codex CLI](https://github.com/openai/codex) 是 OpenAI 推出的终端 AI 助手，支持 MCP 工具调用。

配置文件路径：`~/.codex/config.json`

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

使用示例：

```bash
codex "查询苹果公司的实时股价"
codex "分析一下创业板指数最近的技术形态"
```

---

### Gemini CLI（Google）

[Gemini CLI](https://github.com/google/gemini-cli) 是 Google 推出的命令行 AI 助手，支持通过 MCP 扩展能力。

配置文件路径：`~/.gemini/settings.json`

```json
{
  "mcpServers": {
    "stock-sdk": {
      "command": "npx",
      "args": ["-y", "stock-sdk-mcp"]
    }
  }
}
```

使用示例：

```bash
gemini "今天 A 股有哪些涨停板概念比较热？"
gemini "帮我获取腾讯控股的日 K 线并计算均线"
```

---

## 🛠️ 可用 Tools

### 实时行情

| Tool | 描述 |
|------|------|
| `get_quotes_by_query` | **【推荐】** 按名称、代码或拼音获取行情，自动识别 A股/港股/美股 |
| `get_a_share_quotes` | 获取 A 股/指数实时行情（40+ 字段） |
| `get_hk_quotes` | 获取港股实时行情 |
| `get_us_quotes` | 获取美股实时行情 |
| `get_fund_quotes` | 获取公募基金实时净值 |
| `get_all_a_share_quotes` | **【批量】** 获取全市场 A 股行情（5000+ 只） |
| `get_all_hk_quotes` | **【批量】** 获取全市场港股行情（2000+ 只） |
| `get_all_us_quotes` | **【批量】** 获取全市场美股行情（8000+ 只） |

### K 线数据

| Tool | 描述 |
|------|------|
| `get_history_kline` | 获取 A 股历史 K 线（日/周/月） |
| `get_hk_history_kline` | 获取港股历史 K 线 |
| `get_us_history_kline` | 获取美股历史 K 线 |
| `get_minute_kline` | 获取 A 股分钟 K 线（1/5/15/30/60 分钟） |
| `get_today_timeline` | 获取 A 股当日分时走势 |
| `get_kline_with_indicators` | **【重要】** 获取带技术指标的 K 线（MA/MACD/BOLL/KDJ/RSI 等） |

### 板块数据

| Tool | 描述 |
|------|------|
| `get_industry_list` | 获取行业板块列表 |
| `get_industry_spot` | 获取行业板块实时行情 |
| `get_industry_constituents` | 获取行业板块成分股 |
| `get_industry_kline` | 获取行业板块 K 线 |
| `get_concept_list` | 获取概念板块列表 |
| `get_concept_spot` | 获取概念板块实时行情 |
| `get_concept_constituents` | 获取概念板块成分股 |
| `get_concept_kline` | 获取概念板块 K 线 |

### 代码列表

| Tool | 描述 |
|------|------|
| `get_a_share_code_list` | 获取全部 A 股代码（5000+ 只） |
| `get_hk_code_list` | 获取全部港股代码（2000+ 只） |
| `get_us_code_list` | 获取全部美股代码（8000+ 只） |
| `get_fund_code_list` | 获取全部基金代码（26000+ 只） |

### 搜索

| Tool | 描述 |
|------|------|
| `search_stock` | 搜索股票（支持代码、名称、拼音模糊匹配） |

### 扩展功能

| Tool | 描述 |
|------|------|
| `get_fund_flow` | 获取个股/板块资金流向 |
| `get_panel_large_order` | 获取盘口大单占比 |
| `get_trading_calendar` | 获取 A 股交易日历 |
| `get_dividend_detail` | 获取分红派送详情 |

---

## 📚 可用 Resources

MCP Resources 是静态数据资源，可供 AI 主动读取：

| URI | 描述 |
|-----|------|
| `stock://calendar/trading` | A 股交易日历 |
| `stock://market/a-share/codes` | A 股代码列表 |
| `stock://market/hk/codes` | 港股代码列表 |
| `stock://market/us/codes` | 美股代码列表 |
| `stock://market/fund/codes` | 基金代码列表 |
| `stock://board/industry/list` | 行业板块列表 |
| `stock://board/concept/list` | 概念板块列表 |

---

## 💡 使用示例

配置完成后，你可以在 AI 对话中直接输入：

```
请帮我查询贵州茅台（600519）的实时行情

获取腾讯控股（00700）最近 30 天的日 K 线，并计算 MACD 和布林带

查看人工智能概念板块有哪些成分股，以及今天涨幅前 5 的股票

获取全市场科创板股票的实时行情，按涨幅排序

苹果公司最近的 RSI 指标是多少？是否超买？
```

---

## 🧑‍💻 本地开发

```bash
# 安装依赖
yarn install

# 开发模式（监听文件变化自动重新构建）
yarn dev

# 构建生产版本
yarn build

# 运行服务
yarn start

# 运行测试
yarn test
```

### 调试 MCP Server

你可以通过管道发送 JSON-RPC 消息来测试：

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_quotes_by_query", "arguments": {"queries": ["茅台"]}}}' | node dist/index.js
```

---

## 📄 License

ISC © [chengzuopeng](https://github.com/chengzuopeng/stock-sdk-mcp)

---

## 🔗 相关链接

- [OpenClaw](https://github.com/anthropics/clawdbot) - MCP 网关
- [stock-sdk](https://www.npmjs.com/package/stock-sdk) - 核心 SDK 库
- [MCP Protocol](https://modelcontextprotocol.io) - Model Context Protocol 官方文档
- [Cursor](https://cursor.sh) - AI 代码编辑器
- [Claude Desktop](https://claude.ai/download) - Anthropic 桌面客户端
