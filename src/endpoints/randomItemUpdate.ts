import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class RandomItemUpdate extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Update a random select item",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({ message: z.string() }) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const { message } = (await this.getValidatedData<typeof this.schema>()).body;
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE random_select_item SET message = ? WHERE id = ? AND user_id = ?"
		).bind(message, id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "条目不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
