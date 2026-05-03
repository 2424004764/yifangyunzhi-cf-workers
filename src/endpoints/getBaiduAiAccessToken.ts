import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

const BAIDU_TOKEN_KEY = "baidu_ai_access_token";

export class GetBaiduAiAccessToken extends OpenAPIRoute {
	schema = {
		tags: ["Baidu"],
		summary: "Get a valid Baidu AI access token (cached)",
	};

	async handle(c: AppContext) {
		// 1. 检查缓存的 token
		const cached = await c.env.yifangyunzhi.prepare(
			"SELECT config_value FROM system_config WHERE config_key = ?"
		).bind(BAIDU_TOKEN_KEY).first<{ config_value: string }>();

		if (cached) {
			try {
				const tokenData = JSON.parse(cached.config_value);
				const now = Date.now() / 1000;
				// token 提前 1 小时过期，避免边界情况
				if (tokenData.expires_at > now + 3600) {
					return ok(c, tokenData.access_token);
				}
			} catch { /* 缓存损坏，重新获取 */ }
		}

		// 2. 从百度获取新 token
		if (!c.env.BAIDU_API_KEY || !c.env.BAIDU_SECRET_KEY) {
			return fail(c, "百度 API 密钥未配置", 500);
		}

		try {
			const tokenRes = await fetch(
				`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${c.env.BAIDU_API_KEY}&client_secret=${c.env.BAIDU_SECRET_KEY}`,
				{ method: "POST" }
			);
			const tokenJson = await tokenRes.json() as { access_token?: string; expires_in?: number; error?: string };

			if (!tokenJson.access_token) {
				console.error("[baidu token]", tokenJson);
				return fail(c, tokenJson.error ?? "获取百度 token 失败", 500);
			}

			// 缓存 token（过期时间减 1 天作为安全余量）
			const expires_at = Math.floor(Date.now() / 1000) + (tokenJson.expires_in ?? 2592000) - 86400;
			const cachedValue = JSON.stringify({
				access_token: tokenJson.access_token,
				expires_at,
			});

			await c.env.yifangyunzhi.prepare(
				"INSERT OR REPLACE INTO system_config (config_key, config_value) VALUES (?, ?)"
			).bind(BAIDU_TOKEN_KEY, cachedValue).run();

			return ok(c, tokenJson.access_token);
		} catch (e) {
			console.error("[baidu token]", e);
			return fail(c, "获取百度 token 失败", 500);
		}
	}
}
