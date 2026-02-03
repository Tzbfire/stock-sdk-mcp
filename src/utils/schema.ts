/**
 * JSON Schema 工具函数
 * 用于将 Zod schema 转换为 MCP 工具的 inputSchema
 */

import { z } from 'zod';

/**
 * 将 Zod schema 转换为 JSON Schema 格式
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodType;
      properties[key] = zodToJsonSchema(fieldSchema);

      // 检查是否必填（不是 optional）
      if (!(fieldSchema instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
      ...(schema.description ? { description: schema.description } : {}),
    };
  }

  if (schema instanceof z.ZodString) {
    return {
      type: 'string',
      ...(schema.description ? { description: schema.description } : {}),
    };
  }

  if (schema instanceof z.ZodNumber) {
    return {
      type: 'number',
      ...(schema.description ? { description: schema.description } : {}),
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return {
      type: 'boolean',
      ...(schema.description ? { description: schema.description } : {}),
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema.options,
      ...(schema.description ? { description: schema.description } : {}),
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  if (schema instanceof z.ZodDefault) {
    const innerSchema = zodToJsonSchema(schema.removeDefault());
    return {
      ...innerSchema,
      default: schema._def.defaultValue(),
    };
  }

  return { type: 'string' };
}
