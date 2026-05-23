import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomItemBatchCreate extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Batch create random select items",
		request: {
			body: { content: { "application/json": { schema: z.object({
				group_id: z.coerce.number(),
				messages: z.array(z.string()).min(1),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { group_id, messages } = (await this.getValidatedData<typeof this.schema>()).body;
		const userId = c.get("userId");
		const now = Math.floor(Date.now() / 1000);

		// 查询该分组下已有的消息，做去重
		const existing = await c.env.yifangyunzhi.prepare(
			"SELECT message FROM random_select_item WHERE group_id = ? AND user_id = ?"
		).bind(group_id, userId).all();
		const existingSet = new Set(existing.results.map((r: any) => r.message));

		const newMessages = messages.filter(msg => !existingSet.has(msg));
		if (!newMessages.length) {
			return ok(c, { ids: [], skipped: messages.length });
		}

		// 批量插入新增的消息
		const placeholders = newMessages.map(() => "(?, ?, ?, ?)").join(", ");
		const values: (string | number)[] = [];
		for (const msg of newMessages) {
			values.push(userId, group_id, msg, now);
		}

		const newIds = newMessages.map(() => crypto.randomUUID().replace(/-/g, ""));
		const placeholders = newMessages.map(() => "(?, ?, ?, ?, ?)").join(", ");
		const values: (string | number)[] = [];
		for (let i = 0; i < newMessages.length; i++) {
			values.push(newIds[i], userId, group_id, newMessages[i], now);
		}

		await c.env.yifangyunzhi.prepare(
			`INSERT INTO random_select_item (id, user_id, group_id, message, created_on) VALUES ${placeholders}`
		).bind(...values).run();

		return ok(c, { ids: newIds, skipped: messages.length - newMessages.length });
	}
}
