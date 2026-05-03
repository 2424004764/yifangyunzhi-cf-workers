import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnnualSavingsDelete extends OpenAPIRoute {
	schema = {
		tags: ["AnnualSavings"],
		summary: "Delete an annual savings record",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM annual_savings WHERE id = ? AND user_id = ?"
		).bind(id, c.get("userId")).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
