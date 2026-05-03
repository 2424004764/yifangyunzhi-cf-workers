import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class YfdPriceList extends OpenAPIRoute {
	schema = {
		tags: ["YfdPrice"],
		summary: "List YFD sell price history",
		request: { query: z.object({ cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM yfd_sell_price WHERE user_id = ? AND created_on < ? ORDER BY created_on DESC LIMIT 22"
			).bind(userId, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT * FROM yfd_sell_price WHERE user_id = ? ORDER BY created_on DESC LIMIT 22"
			).bind(userId).all();
		}
		const list = rows.results;
			return ok(c, list);
	}
}
