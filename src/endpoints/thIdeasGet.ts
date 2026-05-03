import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class ThIdeasGet extends OpenAPIRoute {
	schema = {
		tags: ["ThIdeas"],
		summary: "Get a single article by id",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const row = await c.env.yifangyunzhi.prepare(
			"SELECT id AS _id, user_id, title, content, excerpt, article_status, publish_date, last_modify_date, publish_ip, last_modify_ip FROM articles WHERE id = ?"
		).bind(id).first();
		if (!row) return fail(c, "文章不存在", 404);
		return ok(c, row);
	}
}
