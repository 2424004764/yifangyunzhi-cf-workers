import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class OnenoteList extends OpenAPIRoute {
	schema = {
		tags: ["Onenote"],
		summary: "Get onenote list with page count",
		request: {
			query: z.object({
				page: z.coerce.number().default(1),
				pagesize: z.coerce.number().default(22),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { page, pagesize } = data.query;
		const user_id = c.get("userId") as string;

		const countRow = await c.env.yifangyunzhi.prepare(
			"SELECT COUNT(*) as total FROM onenote WHERE user_id = ?"
		).bind(user_id).first<{ total: number }>();

		const total = countRow?.total ?? 0;
		if (!total) return ok(c, { list: [], count: 0 });

		const offset = (page - 1) * pagesize;
		const rows = await c.env.yifangyunzhi.prepare(
			`SELECT o.*, (
				SELECT COUNT(*) FROM additive_list WHERE type = o.id
			) as count
			FROM onenote o
			WHERE o.user_id = ?
			ORDER BY o.created_on DESC
			LIMIT ? OFFSET ?`
		).bind(user_id, pagesize, offset).all<Record<string, unknown>>();

		const list = rows.results;

		return ok(c, { list, count: total });
	}
}
