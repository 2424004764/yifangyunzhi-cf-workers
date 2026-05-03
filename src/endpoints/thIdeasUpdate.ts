import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

const clientIP = (c: AppContext) =>
	c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;

export class ThIdeasUpdate extends OpenAPIRoute {
	schema = {
		tags: ["ThIdeas"],
		summary: "Update an article",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({
				title: z.string().optional(),
				content: z.string().optional(),
				excerpt: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const userId = c.get("userId");

		// 先查所有权
		const row = await c.env.yifangyunzhi.prepare(
			"SELECT id FROM articles WHERE id = ? AND user_id = ?"
		).bind(id, userId).first();
		if (!row) return fail(c, "文章不存在", 404);

		const now = Date.now();
		await c.env.yifangyunzhi.prepare(
			"UPDATE articles SET title = COALESCE(?, title), content = COALESCE(?, content), excerpt = COALESCE(?, excerpt), last_modify_date = ?, last_modify_ip = ? WHERE id = ?"
		).bind(d.title ?? null, d.content ?? null, d.excerpt ?? null, now, clientIP(c), id).run();
		return ok(c, { updated: true });
	}
}
