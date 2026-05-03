import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ChatSessionDelete extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Delete a chat session and its messages",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const userId = c.get("userId");
		await c.env.yifangyunzhi.prepare("DELETE FROM ai_message_list WHERE session_id = ? AND user_id = ?").bind(id, userId).run();
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM chat_session WHERE session_id = ? AND user_id = ?").bind(id, userId).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
