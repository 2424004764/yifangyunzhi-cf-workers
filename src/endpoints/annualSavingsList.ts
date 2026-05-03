import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnnualSavingsList extends OpenAPIRoute {
	schema = {
		tags: ["AnnualSavings"],
		summary: "List annual savings",
		request: {
			query: z.object({
				uid: z.string().optional(),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const uid = data.query.uid || c.get("userId");
		const rows = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM annual_savings WHERE user_id = ? ORDER BY year DESC"
		).bind(uid).all();
		const list = rows.results;
		return ok(c, list);
	}
}
