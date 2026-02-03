#!/bin/bash

# Stock SDK MCP Server 安装脚本
# 适用于 macOS/Linux

set -e

echo "🚀 Stock SDK MCP Server 安装脚本"
echo "================================"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SERVER_DIR="$SCRIPT_DIR"

echo ""
echo "📦 步骤 1: 安装依赖..."
cd "$MCP_SERVER_DIR"
yarn install

echo ""
echo "🔨 步骤 2: 构建项目..."
yarn build

echo ""
echo "✅ 构建完成！"
echo ""
echo "📝 步骤 3: 配置 AI 工具"
echo ""

# 检测 Cursor 配置
CURSOR_CONFIG="$HOME/.cursor/mcp.json"
if [ -d "$HOME/.cursor" ]; then
    echo "检测到 Cursor IDE，配置文件路径: $CURSOR_CONFIG"
fi

# 检测 Claude Desktop 配置
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -d "$HOME/Library/Application Support/Claude" ]; then
    echo "检测到 Claude Desktop，配置文件路径: $CLAUDE_CONFIG"
fi

echo ""
echo "请在对应的配置文件中添加以下内容："
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "stock-sdk": {'
echo '      "command": "node",'
echo "      \"args\": [\"$MCP_SERVER_DIR/dist/index.js\"]"
echo '    }'
echo '  }'
echo '}'
echo ""
echo "================================"
echo "🎉 安装完成！重启你的 AI 工具即可使用。"
echo ""
echo "测试命令（在 Cursor/Claude 中）："
echo "  - 查询茅台股价"
echo "  - 获取腾讯控股的 K 线"
echo "  - 今天有什么热点板块"
