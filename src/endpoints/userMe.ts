import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

const AvatarFile = z.object({
	extname: z.string(),
	name: z.string(),
	url: z.string(),
}).nullable();

export class UserMe extends OpenAPIRoute {
	schema = {
		tags: ["User"],
		summary: "获取当前用户信息",
		responses: {
			"200": {
				description: "用户信息",
				content: {
					"application/json": {
						schema: z.object({
							code: z.number(),
							msg: z.string(),
							data: z.object({
								id: z.union([z.string(), z.number()]),
								wx_openid: z.string(),
								nickname: z.string().nullable(),
								avatar_file: AvatarFile,
								role: z.array(z.string()),
								last_login_date: z.number().nullable(),
								register_date: z.number().nullable(),
							}).nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const userId = c.get("userId");

		const user = await c.env.yifangyunzhi.prepare(
			"SELECT id, wx_openid, nickname, avatar_file, role, last_login_date, register_date FROM user WHERE id = ?"
		).bind(userId).first<{
			id: string | number;
			wx_openid: string;
			nickname: string | null;
			avatar_file: string | null;
			role: string;
			last_login_date: number | null;
			register_date: number | null;
		}>();

		if (!user) {
			return fail(c, "用户不存在", 404);
		}

		return ok(c, {
			...user,
			avatar_file: parseAvatar(user.avatar_file),
			role: parseRole(user.role),
		});
	}
}

function parseAvatar(val: string | null): Record<string, string> | null {
	if (!val) return null;
	try { return JSON.parse(val); }
	catch { return null; }
}

function parseRole(val: string): string[] {
	try { return JSON.parse(val); }
	catch { return []; }
}
