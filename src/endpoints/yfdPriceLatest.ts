import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class YfdPriceLatest extends OpenAPIRoute {
	schema = { tags: ["YfdPrice"], summary: "Get latest YFD sell price" };

	async handle(c: AppContext) {
		const row = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM yfd_sell_price WHERE user_id = ? ORDER BY created_on DESC LIMIT 1"
		).bind(c.get("userId")).first<{ id: number; yfd_sell_price: string; created_on: number }>();
		if (!row) return ok(c, null);
		return ok(c, row);
	}
}
