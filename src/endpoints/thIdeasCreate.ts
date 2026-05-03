import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

const clientIP = (c: AppContext) =>
	c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? null;

export class ThIdeasCreate extends OpenAPIRoute {
	schema = {
		tags: ["ThIdeas"],
		summary: "Create a new article",
		request: {
			body: { content: { "application/json": { schema: z.object({
				title: z.string(),
				content: z.string(),
				excerpt: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const userId = c.get("userId");
		const now = Date.now();
		const id = crypto.randomUUID().replace(/-/g, "");
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO articles (id, user_id, title, content, excerpt, article_status, publish_date, last_modify_date, publish_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
		).bind(id, userId, d.title, d.content, d.excerpt ?? null, 1, now, now, clientIP(c)).run();
		return ok(c, { id });
	}
}
