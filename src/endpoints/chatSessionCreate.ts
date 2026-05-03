import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class ChatSessionCreate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Create a chat session",
		request: {
			body: { content: { "application/json": { schema: z.object({
				id: z.string(), session_id: z.string(), session_title: z.string().optional(), session_type: z.number().optional().default(1), template_content: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO chat_session (id, user_id, session_id, session_title, session_type, template_content, created_on) VALUES (?, ?, ?, ?, ?, ?, ?)"
		).bind(d.id, c.get("userId"), d.session_id, d.session_title ?? null, d.session_type, d.template_content ?? null, now).run();
		return ok(c, { session_id: d.session_id });
	}
}
