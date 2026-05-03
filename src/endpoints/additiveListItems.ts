import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveListItems extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveList"],
		summary: "List additive pages under a type",
		request: { query: z.object({ type_id: z.string(), cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { type_id, cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM additive_list WHERE type_id = ? AND created_on < ? ORDER BY created_on DESC LIMIT 22"
			).bind(type_id, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM additive_list WHERE type_id = ? ORDER BY created_on DESC"
			).bind(type_id).all();
		}
		return ok(c, rows.results);
	}
}
