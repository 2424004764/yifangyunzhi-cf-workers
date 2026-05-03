import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ChatMessageList extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "List chat messages",
		request: { query: z.object({ session_id: z.string(), cursor: z.coerce.number().optional() }) },
	};

	async handle(c: AppContext) {
		const { session_id, cursor } = (await this.getValidatedData<typeof this.schema>()).query;
		const userId = c.get("userId");
		let rows;
		if (cursor) {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT message_id, session_id, user_id, \"user\", message, created_on FROM ai_message_list WHERE session_id = ? AND user_id = ? AND created_on < ? ORDER BY created_on ASC LIMIT 50"
			).bind(session_id, userId, cursor).all();
		} else {
			rows = await c.env.yifangyunzhi.prepare(
				"SELECT message_id, session_id, user_id, \"user\", message, created_on FROM ai_message_list WHERE session_id = ? AND user_id = ? ORDER BY created_on ASC LIMIT 50"
			).bind(session_id, userId).all();
		}
		return ok(c, rows.results);
	}
}
