import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class OnenoteUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Onenote"],
		summary: "Update an onenote",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							title: z.string().optional(),
							icon_color: z.string().optional(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id, title, icon_color } = data.body;
		const now = Math.floor(Date.now() / 1000);

		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE onenote SET title = COALESCE(?, title), icon_color = COALESCE(?, icon_color), updated_on = ? WHERE id = ?"
		).bind(title ?? null, icon_color ?? null, now, id).run();

		return ok(c, { updated: result.meta.changes });
	}
}
