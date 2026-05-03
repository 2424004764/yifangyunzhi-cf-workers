import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class BirthdayGroups extends OpenAPIRoute {
	schema = { tags: ["Birthday"], summary: "List distinct groups with counts" };

	async handle(c: AppContext) {
		const rows = await c.env.yifangyunzhi.prepare(
			"SELECT group_name AS id, COUNT(*) AS total FROM brithday_remark WHERE user_id = ? AND group_name IS NOT NULL AND group_name != '' GROUP BY group_name ORDER BY MIN(created_on) DESC"
		).bind(c.get("userId")).all<{ id: string; total: number }>();
		return ok(c, rows.results);
	}
}
