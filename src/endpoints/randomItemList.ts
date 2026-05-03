import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomItemList extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "List random select items",
		request: { query: z.object({ group_id: z.coerce.number(), cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { group_id, cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM random_select_item WHERE group_id = ? AND user_id = ? AND created_on < ? ORDER BY created_on DESC LIMIT 50"
			).bind(group_id, userId, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM random_select_item WHERE group_id = ? AND user_id = ? ORDER BY created_on DESC LIMIT 50"
			).bind(group_id, userId).all();
		}
		return ok(c, rows.results);
	}
}
