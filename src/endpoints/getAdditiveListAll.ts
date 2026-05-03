import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetAdditiveListAll extends OpenAPIRoute {
	schema = {
		tags: ["Additive"],
		summary: "Get all additive pages under a notebook (up to 100)",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							type: z.string().describe("onenote_id"),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { type } = data.body;

		const rows = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM additive_list WHERE type = ? LIMIT 100"
		).bind(type).all<Record<string, unknown>>();

		return ok(c, rows.results);
	}
}
