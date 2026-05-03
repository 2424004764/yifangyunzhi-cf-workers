import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomItemDeleteByGroup extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Delete all items in a group",
		request: { params: z.object({ group_id: z.coerce.number() }) },
	};

	async handle(c: AppContext) {
		const { group_id } = (await this.getValidatedData<typeof this.schema>()).params;
		const userId = c.get("userId");
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM random_select_item WHERE group_id = ? AND user_id = ?"
		).bind(group_id, userId).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
