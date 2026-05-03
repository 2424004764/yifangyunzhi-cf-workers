import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeGroupItemDelete extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "Delete an anime group item",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM anime_gen_group_item WHERE id = ?").bind(id).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
