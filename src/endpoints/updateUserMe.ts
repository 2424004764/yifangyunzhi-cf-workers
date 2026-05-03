import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

const AvatarFile = z.object({
	extname: z.string(),
	name: z.string(),
	url: z.string(),
}).nullable();

export class UpdateUserMe extends OpenAPIRoute {
	schema = {
		tags: ["User"],
		summary: "更新当前用户信息（昵称、头像等）",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							nickname: z.string().optional(),
							avatar_file: AvatarFile.optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "更新成功",
				content: {
					"application/json": {
						schema: z.object({
							code: z.number(),
							msg: z.string(),
							data: z.object({
								id: z.union([z.string(), z.number()]),
								nickname: z.string().nullable(),
								avatar_file: AvatarFile,
							}).nullable(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const userId = c.get("userId");
		const data = await this.getValidatedData<typeof this.schema>();
		const { nickname, avatar_file } = data.body;

		if (!nickname && !avatar_file) {
			return fail(c, "没有需要更新的字段", 400);
		}

		const sets: string[] = [];
		const values: (string | number)[] = [];

		if (nickname !== undefined) {
			sets.push("nickname = ?");
			values.push(nickname);
		}
		if (avatar_file !== undefined) {
			sets.push("avatar_file = ?");
			values.push(JSON.stringify(avatar_file));
		}

		values.push(userId as string | number);

		await c.env.yifangyunzhi.prepare(
			`UPDATE user SET ${sets.join(", ")} WHERE id = ?`
		).bind(...values).run();

		const user = await c.env.yifangyunzhi.prepare(
			"SELECT id, nickname, avatar_file FROM user WHERE id = ?"
		).bind(userId as string | number).first<{
			id: string | number;
			nickname: string | null;
			avatar_file: string | null;
		}>();

		return ok(c, {
			...user,
			avatar_file: user?.avatar_file ? (() => {
				try { return JSON.parse(user.avatar_file); }
				catch { return null; }
			})() : null,
		});
	}
}
