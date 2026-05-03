import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class BirthdayDelete extends OpenAPIRoute {
	schema = {
		tags: ["Birthday"],
		summary: "Delete a birthday remark",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM brithday_remark WHERE id = ? AND user_id = ?"
		).bind(id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "记录不存在", 404);
		return ok(c, { deleted: result.meta.changes });
	}
}
