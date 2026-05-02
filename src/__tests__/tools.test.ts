/**
 * Tools 基础测试
 * 验证工具注册、handler 完整性、名称唯一性
 */

import { describe, it, expect } from 'vitest';
import { getAllTools, createAllHandlers } from '../tools/index.js';
import { getAllPrompts, createPromptHandlers } from '../prompts/index.js';

// 使用空对象模拟 SDK（仅测试注册完整性，不发起真实请求）
const mockSdk = new Proxy(
  {},
  {
    get: (_target, prop) => {
      // 返回一个 mock 函数，让 handler 创建不报错
      if (typeof prop === 'string' && prop.startsWith('get')) {
        return (..._args: unknown[]) => Promise.resolve([]);
      }
      return undefined;
    },
  }
) as any;

describe('Tools Registry', () => {
  const tools = getAllTools();
  const handlers = createAllHandlers(mockSdk);

  it('should have unique tool names', () => {
    const names = tools.map((t) => t.name);
    const unique = new Set(names);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates).toEqual([]);
    expect(unique.size).toBe(names.length);
  });

  it('every tool should have a corresponding handler', () => {
    const missing = tools
      .map((t) => t.name)
      .filter((name) => !(name in handlers));
    expect(missing).toEqual([]);
  });

  it('every handler should have a corresponding tool definition', () => {
    const toolNames = new Set(tools.map((t) => t.name));
    const orphans = Object.keys(handlers).filter((name) => !toolNames.has(name));
    expect(orphans).toEqual([]);
  });

  it('all tools should have readOnlyHint annotation', () => {
    const nonReadOnly = tools.filter((t) => !t.annotations?.readOnlyHint);
    expect(nonReadOnly.map((t) => t.name)).toEqual([]);
  });

  it('all tools should have inputSchema with type "object"', () => {
    const invalid = tools.filter((t) => t.inputSchema.type !== 'object');
    expect(invalid.map((t) => t.name)).toEqual([]);
  });

  it('should have expected number of tools (54 base + 15 new = 69)', () => {
    expect(tools.length).toBe(69);
  });
});

describe('Prompts Registry', () => {
  const prompts = getAllPrompts();
  const handlers = createPromptHandlers();

  it('should have unique prompt names', () => {
    const names = prompts.map((p) => p.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('every prompt should have a corresponding handler', () => {
    const missing = prompts.map((p) => p.name).filter((name) => !(name in handlers));
    expect(missing).toEqual([]);
  });

  it('every handler should have a corresponding prompt definition', () => {
    const promptNames = new Set(prompts.map((p) => p.name));
    const orphans = Object.keys(handlers).filter((name) => !promptNames.has(name));
    expect(orphans).toEqual([]);
  });

  it('prompt handlers should return valid messages', () => {
    for (const prompt of prompts) {
      const handler = handlers[prompt.name];
      const result = handler({});
      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.type).toBe('text');
      expect(result.messages[0].content.text.length).toBeGreaterThan(0);
    }
  });

  it('prompt messages should reference existing tool names', () => {
    const toolNames = new Set(getAllTools().map((t) => t.name));
    const toolNamePattern = /\b(get_\w+|analyze_stock|compare_stocks|scan_market|search_stock)\b/g;

    for (const prompt of prompts) {
      const handler = handlers[prompt.name];
      const result = handler({});
      const text = result.messages[0].content.text;
      const referenced = [...text.matchAll(toolNamePattern)].map((m) => m[1]);
      const unknown = referenced.filter((name) => !toolNames.has(name));
      expect(unknown, `Prompt "${prompt.name}" references unknown tools`).toEqual([]);
    }
  });

  it('should have 6 prompts total', () => {
    expect(prompts.length).toBe(6);
  });
});

describe('Tool Handler Branching (discriminated unions)', () => {
  it('get_fund_flow_rank should reject sector scope without sectorType', async () => {
    const handlers = createAllHandlers(mockSdk);
    await expect(
      handlers.get_fund_flow_rank({ scope: 'sector', indicator: 'today' })
    ).rejects.toThrow(/sectorType/);
  });

  it('get_northbound_history should reject stock scope without symbol', async () => {
    const handlers = createAllHandlers(mockSdk);
    await expect(
      handlers.get_northbound_history({ scope: 'stock' })
    ).rejects.toThrow(/symbol/);
  });

  it('get_dragon_tiger_stats should reject institution type without dates', async () => {
    const handlers = createAllHandlers(mockSdk);
    await expect(
      handlers.get_dragon_tiger_stats({ type: 'institution' })
    ).rejects.toThrow(/startDate|endDate/);
  });
});
