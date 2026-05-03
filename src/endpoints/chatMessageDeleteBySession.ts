import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ChatMessageDeleteBySession extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Delete all messages in a session",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM ai_message_list WHERE session_id = ? AND user_id = ?"
		).bind(id, c.get("userId")).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
