import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

const PAGE_SIZE = 20;
const LIMIT = PAGE_SIZE + 1; // +1 to detect if there are more items

export class ChatSessionList extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "List chat sessions",
		request: { query: z.object({ cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		const rows = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM chat_session WHERE user_id = ?" +
			(cursor ? " AND created_on < ?" : "") +
			" ORDER BY created_on DESC LIMIT ?"
		).bind(userId, ...(cursor ? [cursor] : []), LIMIT).all();

		const results = rows.results;
		const has_more = results.length === LIMIT;
		const next_cursor = has_more ? results[results.length - 1].created_on : null;
		if (has_more) results.pop();
		return ok(c, { list: results, next_cursor, has_more });
	}
}
