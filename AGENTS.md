# Cloudflare Workers

**警告：** 你对 Cloudflare Workers API 及限制的了解可能已过时。在执行 Workers、KV、R2、D1、Durable Objects、Queues、Vectorize、AI 或 Agents SDK 相关任务之前，请务必查阅最新文档。

## 文档

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

所有限制和配额信息，请前往对应产品的 `/platform/limits/` 页面查看，例如 `/workers/platform/limits`。

## 命令

| 命令 | 用途 |
|---------|---------|
| `npx wrangler dev` | 本地开发 |
| `npx wrangler deploy` | 部署到 Cloudflare |
| `npx wrangler types` | 生成 TypeScript 类型 |

修改 `wrangler.jsonc` 中的绑定配置后，请运行 `wrangler types`。

## Node.js 兼容性

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## 错误

- **错误 1102**（CPU/内存超限）：从 `/workers/platform/limits/` 查看限制信息
- **所有错误**：https://developers.cloudflare.com/workers/observability/errors/

## 产品文档

API 参考和限制信息请前往以下路径查阅：
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## 最佳实践（按需）

如果应用使用了 Durable Objects 或 Workflows，请参考相关最佳实践：

- Durable Objects：https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows：https://developers.cloudflare.com/workflows/build/rules-of-workflows/
