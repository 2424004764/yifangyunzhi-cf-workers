import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class AnimeGroupGet extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "Get an anime generation group by ID with its items",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const group = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM anime_gen_group WHERE id = ?"
		).bind(id).first();

		if (!group) return fail(c, "Group not found", 404);

		const items = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM anime_gen_group_item WHERE group_id = ? ORDER BY created_on ASC"
		).bind(id).all();

		return ok(c, { ...group, group_id: (group as any).id, item_list: items.results });
	}
}
