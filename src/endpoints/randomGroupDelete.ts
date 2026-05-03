import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomGroupDelete extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Delete a random select group and its items",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const userId = c.get("userId");
		await c.env.yifangyunzhi.prepare("DELETE FROM random_select_item WHERE group_id = ? AND user_id = ?").bind(id, userId).run();
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM random_select_group WHERE id = ? AND user_id = ?").bind(id, userId).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
