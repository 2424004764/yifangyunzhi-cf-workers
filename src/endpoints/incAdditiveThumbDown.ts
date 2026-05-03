import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class IncAdditiveThumbDown extends OpenAPIRoute {
	schema = {
		tags: ["Additive"],
		summary: "Increment thumb down for an additive page",
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

		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE additive_list SET thumb_down = thumb_down + 1, updated_on = ? WHERE id = ?"
		).bind(Math.floor(Date.now() / 1000), id).run();

		return ok(c, { updated: result.meta.changes });
	}
}
