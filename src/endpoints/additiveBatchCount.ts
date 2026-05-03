import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveBatchCount extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveType"],
		summary: "Get page count for multiple type IDs",
		request: {
			body: { content: { "application/json": { schema: z.object({ type_ids: z.array(z.string()) }) } } },
		},
	};

	async handle(c: AppContext) {
		const { type_ids } = (await this.getValidatedData<typeof this.schema>()).body;
		if (!type_ids.length) return ok(c, []);
		const placeholders = type_ids.map(() => "?").join(",");
		const rows = await c.env.yifangyunzhi.prepare(
			`SELECT type_id, COUNT(*) as count FROM additive_list WHERE type_id IN (${placeholders}) GROUP BY type_id`
		).bind(...type_ids).all<{ type_id: number; count: number }>();
		return ok(c, rows.results);
	}
}
