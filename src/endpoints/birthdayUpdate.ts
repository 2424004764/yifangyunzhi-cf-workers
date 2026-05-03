import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class BirthdayUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Birthday"],
		summary: "Update a birthday remark",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({
				name: z.string().optional(), avatar: z.string().optional(), brithday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD").optional(),
				is_lunar_date: z.number().optional(), group_name: z.string().optional(),
				remark: z.string().optional(), more_field: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE brithday_remark SET name = COALESCE(?, name), avatar = COALESCE(?, avatar), brithday_date = COALESCE(?, brithday_date), is_lunar_date = COALESCE(?, is_lunar_date), group_name = COALESCE(?, group_name), remark = COALESCE(?, remark), more_field = COALESCE(?, more_field) WHERE id = ? AND user_id = ?"
		).bind(d.name ?? null, d.avatar ?? null, d.brithday_date ?? null, d.is_lunar_date ?? null, d.group_name ?? null, d.remark ?? null, d.more_field ?? null, id, c.get("userId")).run();
		if (!result.meta.changes) return fail(c, "记录不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
