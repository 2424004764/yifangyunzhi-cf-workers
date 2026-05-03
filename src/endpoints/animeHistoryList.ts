import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeHistoryList extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "List anime generation groups with items",
		request: { query: z.object({ cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let sql = "SELECT * FROM anime_gen_group WHERE user_id = ?";
		const binds: Array<unknown> = [userId];
		if (cursor) { sql += " AND created_on < ?"; binds.push(cursor); }
		sql += " ORDER BY created_on DESC LIMIT 22";
		const rows = await c.env.yifangyunzhi.prepare(sql).bind(...binds).all();

		if (!rows.results.length) return ok(c, []);

		// Fetch items for all returned groups in a single query
		const groupIds = rows.results.map((r: any) => r.id);
		const placeholders = groupIds.map(() => '?').join(',');
		const items = await c.env.yifangyunzhi.prepare(
			`SELECT * FROM anime_gen_group_item WHERE group_id IN (${placeholders}) ORDER BY created_on ASC`
		).bind(...groupIds).all();

		// Group items by group_id
		const itemMap = new Map<number, any[]>();
		for (const item of items.results) {
			const list = itemMap.get(item.group_id) || [];
			list.push(item);
			itemMap.set(item.group_id, list);
		}

		// Combine groups with their items
		const result = rows.results.map((r: any) => ({
			...r,
			group_id: r.id,
			item_list: itemMap.get(r.id) || [],
		}));

		return ok(c, result);
	}
}
