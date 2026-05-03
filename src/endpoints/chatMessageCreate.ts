import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ChatMessageCreate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Create a chat message",
		request: {
			body: { content: { "application/json": { schema: z.object({
				id: z.string(), message_id: z.string(), session_id: z.string(), user: z.string(), message: z.string(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const userId = c.get("userId");
		const now = Math.floor(Date.now() / 1000);
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO ai_message_list (id, message_id, session_id, user_id, \"user\", message, created_on) VALUES (?, ?, ?, ?, ?, ?, ?)"
		).bind(d.id, d.message_id, d.session_id, userId, d.user, d.message, now).run();
		return ok(c, { id: d.message_id });
	}
}
