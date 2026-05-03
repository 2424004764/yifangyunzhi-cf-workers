import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class ThIdeasDelete extends OpenAPIRoute {
	schema = {
		tags: ["ThIdeas"],
		summary: "Delete a articles article",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM articles WHERE id = ? AND user_id = ?"
		).bind(id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "记录不存在", 404);
		return ok(c, { deleted: result.meta.changes });
	}
}
