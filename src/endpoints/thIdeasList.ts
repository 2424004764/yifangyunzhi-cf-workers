import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ThIdeasList extends OpenAPIRoute {
	schema = {
		tags: ["ThIdeas"],
		summary: "List articles articles with pagination",
		request: {
			query: z.object({
				user_id: z.string(),
				page: z.coerce.number().optional().default(1),
				page_size: z.coerce.number().optional().default(20),
			}),
		},
	};

	async handle(c: AppContext) {
		const { user_id, page, page_size } = (await this.getValidatedData<typeof this.schema>()).query;
		const offset = (page - 1) * page_size;

		const countRow = await c.env.yifangyunzhi.prepare(
			"SELECT COUNT(*) AS total FROM articles WHERE user_id = ?"
		).bind(user_id).first<{ total: number }>();
		const total = countRow?.total ?? 0;

		const { results } = await c.env.yifangyunzhi.prepare(
			"SELECT id AS _id, title, content, publish_date, last_modify_date FROM articles WHERE user_id = ? ORDER BY publish_date DESC LIMIT ? OFFSET ?"
		).bind(user_id, page_size, offset).all();

		return ok(c, { list: results, total, page, page_size });
	}
}
