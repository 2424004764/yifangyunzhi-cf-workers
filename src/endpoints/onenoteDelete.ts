import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class OnenoteDelete extends OpenAPIRoute {
	schema = {
		tags: ["Onenote"],
		summary: "Delete an onenote and cascade delete types and pages",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.body;

		await c.env.yifangyunzhi.prepare(
			"DELETE FROM additive_list WHERE type_id IN (SELECT id FROM additive_type WHERE type = ?)"
		).bind(id).run();

		await c.env.yifangyunzhi.prepare(
			"DELETE FROM additive_type WHERE type = ?"
		).bind(id).run();

		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM onenote WHERE id = ?"
		).bind(id).run();

		return ok(c, { deleted: result.meta.changes });
	}
}
