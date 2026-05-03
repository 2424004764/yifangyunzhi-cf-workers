# Cloudflare Workers OpenAPI 3.1

这是一个使用 [chanfana](https://github.com/cloudflare/chanfana) 和 [Hono](https://github.com/honojs/hono) 构建的 Cloudflare Worker，支持 OpenAPI 3.1。

该项目作为快速启动模板，用于构建符合 OpenAPI 规范的 Workers，能够自动从代码生成 `openapi.json` schema 文件，并验证传入请求的参数或请求体。

## 快速开始

1. 注册 [Cloudflare Workers](https://workers.dev) 账号（免费套餐足以满足大多数使用场景）。
2. 克隆本项目，并运行 `npm install` 安装依赖。
3. 运行 `wrangler login` 登录你的 Cloudflare 账号。
4. 运行 `wrangler dev` 启动本地 API 实例：
   - `wrangler dev --remote` 可连接线上数据库
   - `wrangler dev --ip 0.0.0.0` 可在局域网内访问
5. 运行 `wrangler deploy` 将 API 发布到 Cloudflare Workers。
6. 设置环境变量命令：`wrangler secret put <key>` 回车，输入变量值。
7. 本地sql执行到远端sql：`wrangler d1 execute <db_name> --remote --file <file_path>`、执行到本地sql：`wrangler d1 execute <db_name> --file <file_path>`。

## 项目结构

1. 路由入口定义在 `src/index.ts` 中。
2. 每个端点对应 `src/endpoints/` 下的一个独立文件。
3. 更多信息请查阅 [chanfana 文档](https://chanfana.pages.dev/) 和 [Hono 文档](https://hono.dev/docs)。

## 开发

1. 运行 `wrangler dev` 启动本地 API 实例。
2. 在浏览器中打开 `http://localhost:8787/` 查看 Swagger 界面，你可以在其中测试各个端点。
3. `src/` 文件夹中的更改会自动触发服务器重新加载，你只需刷新 Swagger 界面即可。
