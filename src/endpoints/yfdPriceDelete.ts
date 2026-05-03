import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class YfdPriceDelete extends OpenAPIRoute {
	schema = {
		tags: ["YfdPrice"],
		summary: "Delete a YFD sell price record",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM yfd_sell_price WHERE id = ? AND user_id = ?"
		).bind(id, c.get("userId")).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
