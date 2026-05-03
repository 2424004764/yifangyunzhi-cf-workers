import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveTypeList extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveType"],
		summary: "List additive types under a notebook",
		request: { query: z.object({ type: z.string(), cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { type, cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM additive_type WHERE type = ? AND created_on < ? ORDER BY created_on DESC LIMIT 22"
			).bind(type, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM additive_type WHERE type = ? ORDER BY created_on DESC"
			).bind(type).all();
		}
		return ok(c, rows.results);
	}
}
