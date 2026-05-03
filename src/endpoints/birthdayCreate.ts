import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class BirthdayCreate extends OpenAPIRoute {
	schema = {
		tags: ["Birthday"],
		summary: "Create a birthday remark",
		request: {
			body: { content: { "application/json": { schema: z.object({
				name: z.string(), avatar: z.string().optional(), brithday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD"),
				is_lunar_date: z.number().optional().default(0), group_name: z.string().optional(),
				remark: z.string().optional(), more_field: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const id = crypto.randomUUID().replace(/-/g, "");
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO brithday_remark (id, user_id, name, avatar, brithday_date, is_lunar_date, group_name, remark, more_field, created_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		).bind(id, c.get("userId"), d.name, d.avatar ?? null, d.brithday_date, d.is_lunar_date, d.group_name ?? null, d.remark ?? null, d.more_field ?? null, now).run();
		return ok(c, { id });
	}
}
