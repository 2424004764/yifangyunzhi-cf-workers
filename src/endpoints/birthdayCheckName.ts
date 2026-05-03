import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class BirthdayCheckName extends OpenAPIRoute {
	schema = {
		tags: ["Birthday"],
		summary: "Check if name already exists (dedup)",
		request: { query: z.object({ name: z.string(), id: z.string().optional() }) },
	};

	async handle(c: AppContext) {
		const { name, id } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let sql = "SELECT id FROM brithday_remark WHERE user_id = ? AND name = ?";
		const binds: Array<unknown> = [userId, name];
		if (id) { sql += " AND id != ?"; binds.push(id); }
		const row = await c.env.yifangyunzhi.prepare(sql).bind(...binds).first();
		return ok(c, { total: row ? 1 : 0 });
	}
}
