import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class OnenoteCreate extends OpenAPIRoute {
	schema = {
		tags: ["Onenote"],
		summary: "Create a new onenote",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
							user_id: z.string(),
							title: z.string(),
							icon_color: z.string().optional(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id, user_id, title, icon_color } = data.body;
		const now = Math.floor(Date.now() / 1000);

		const result = await c.env.yifangyunzhi.prepare(
			"INSERT INTO onenote (id, user_id, title, icon_color, created_on, updated_on) VALUES (?, ?, ?, ?, ?, ?)"
		).bind(id, user_id, title, icon_color ?? null, now, now).run();

		return ok(c, { id: result.meta.last_row_id });
	}
}
