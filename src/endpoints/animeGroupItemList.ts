import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeGroupItemList extends OpenAPIRoute {
	schema = {
		tags: ["Anime"],
		summary: "List items in an anime generation group",
		request: { params: z.object({ groupId: z.string() }) },
	};

	async handle(c: AppContext) {
		const { groupId } = (await this.getValidatedData<typeof this.schema>()).params;
		const items = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM anime_gen_group_item WHERE group_id = ? ORDER BY created_on ASC"
		).bind(groupId).all();
		return ok(c, items.results);
	}
}
