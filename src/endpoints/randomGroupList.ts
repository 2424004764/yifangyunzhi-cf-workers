import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomGroupList extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "List random select groups",
		request: { query: z.object({ cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM random_select_group WHERE user_id = ? AND created_on < ? ORDER BY created_on DESC LIMIT 22"
			).bind(userId, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM random_select_group WHERE user_id = ? ORDER BY created_on DESC"
			).bind(userId).all();
		}
		return ok(c, rows.results);
	}
}
