import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeGroupItemCreate extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "Add an item to an anime generation group",
		request: {
			body: { content: { "application/json": { schema: z.object({
				group_id: z.string(), is_row: z.number().optional().default(1), style: z.string().optional(), image_url: z.string(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const id = crypto.randomUUID().replace(/-/g, "");
		const now = Math.floor(Date.now() / 1000);
		const result = await c.env.yifangyunzhi.prepare(
			"INSERT INTO anime_gen_group_item (id, group_id, is_row, style, image_url, created_on, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?)"
		).bind(id, d.group_id, d.is_row, d.style ?? null, d.image_url, now, now).run();
		return ok(c, { id });
	}
}
