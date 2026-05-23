import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";
import { signToken } from "../utils/jwt";

export class AuthLogin extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "微信小程序登录",
		description: "传入微信 wx.login() 返回的 code，换取 openid 并登录或注册用户",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							code: z.string().min(1),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { code } = data.body;

		// 1. 用 code 换取 openid
		const wxUrl =
			`https://api.weixin.qq.com/sns/jscode2session` +
			`?appid=${c.env.WX_APPID}&secret=${c.env.WX_SECRET}` +
			`&js_code=${code}&grant_type=authorization_code`;

		const wxRes = await fetch(wxUrl);
		const wx = await wxRes.json() as { openid?: string; errcode?: number; errmsg?: string };

		if (!wx.openid) {
			return fail(c, wx.errmsg ?? "获取 openid 失败");
		}

		const now = Date.now();

		// 2. 查询或创建用户（wx_openid 存的是 JSON 对象，用 LIKE 模糊匹配）
		const existing = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM user WHERE wx_openid LIKE ?"
		).bind(`%${wx.openid}%`).first<{
			id: string; wx_openid: string; nickname: string | null; avatar_file: string | null;
			role: string; last_login_date: number | null; register_date: number | null;
		}>();

		let user: { id: string | number; wx_openid: string };

		if (existing) {
			await c.env.yifangyunzhi.prepare(
				"UPDATE user SET last_login_date = ? WHERE wx_openid LIKE ?"
			).bind(now, `%${wx.openid}%`).run();
			user = { id: existing.id, wx_openid: existing.wx_openid };
		} else {
			const userId = crypto.randomUUID().replace(/-/g, "");
			const result = await c.env.yifangyunzhi.prepare(
				"INSERT INTO user (id, wx_openid, register_date, last_login_date) VALUES (?, ?, ?, ?)"
			).bind(userId, wx.openid, now, now).run();
			user = { id: userId, wx_openid: wx.openid };
		}

		// 3. 签发 JWT
		const { token, exp } = await signToken({ id: user.id }, c.env.JWT_SECRET);

		return ok(c, { id: user.id, token, exp });

		}
}
