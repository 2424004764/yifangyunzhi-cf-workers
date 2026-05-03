import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class ChatSessionUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Chat"],
		summary: "Update a chat session",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({
				session_title: z.string().optional(), template_content: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE chat_session SET session_title = COALESCE(?, session_title), template_content = COALESCE(?, template_content) WHERE session_id = ? AND user_id = ?"
		).bind(d.session_title ?? null, d.template_content ?? null, id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "会话不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
