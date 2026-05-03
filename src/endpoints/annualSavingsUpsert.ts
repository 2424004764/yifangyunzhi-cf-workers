import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnnualSavingsUpsert extends OpenAPIRoute {
	schema = {
		tags: ["AnnualSavings"],
		summary: "Create or update annual savings",
		request: {
			body: { content: { "application/json": { schema: z.object({
				year: z.number(), income_amount: z.number().optional(), savings_amount: z.number(), description: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const userId = c.get("userId");
		const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");

		const existing = await c.env.yifangyunzhi.prepare(
			"SELECT id, created_date FROM annual_savings WHERE user_id = ? AND year = ?"
		).bind(userId, d.year).first<{ id: string; created_date: string }>();

		if (existing) {
			await c.env.yifangyunzhi.prepare(
				"UPDATE annual_savings SET income_amount = ?, savings_amount = ?, description = ?, updated_date = ? WHERE id = ?"
			).bind(d.income_amount ?? null, d.savings_amount, d.description ?? null, now, existing.id).run();
		} else {
			const id = crypto.randomUUID().replace(/-/g, '');
			await c.env.yifangyunzhi.prepare(
				"INSERT INTO annual_savings (id, user_id, year, income_amount, savings_amount, description, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
			).bind(id, userId, d.year, d.income_amount ?? null, d.savings_amount, d.description ?? null, now, now).run();
			return ok(c, { id });
		}

		return ok(c, null);
	}
}
