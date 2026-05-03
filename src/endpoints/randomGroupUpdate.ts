import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class RandomGroupUpdate extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Update a random select group",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({ group_title: z.string() }) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const { group_title } = (await this.getValidatedData<typeof this.schema>()).body;
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE random_select_group SET group_title = ? WHERE id = ? AND user_id = ?"
		).bind(group_title, id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "分组不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
