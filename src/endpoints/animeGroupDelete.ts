import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeGroupDelete extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "Delete an anime group and its items",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		await c.env.yifangyunzhi.prepare("DELETE FROM anime_gen_group_item WHERE group_id = ?").bind(id).run();
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM anime_gen_group WHERE id = ?").bind(id).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
