import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class YfdPriceCreate extends OpenAPIRoute {
	schema = {
		tags: ["YfdPrice"],
		summary: "Create a YFD sell price record",
		request: {
			body: { content: { "application/json": { schema: z.object({ yfd_sell_price: z.string() }) } } },
		},
	};

	async handle(c: AppContext) {
		const { yfd_sell_price } = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const result = await c.env.yifangyunzhi.prepare(
			"INSERT INTO yfd_sell_price (user_id, yfd_sell_price, created_on) VALUES (?, ?, ?)"
		).bind(c.get("userId"), yfd_sell_price, now).run();
		const id = result.meta.last_row_id;
		return ok(c, { id, yfd_sell_price, created_on: now });
	}
}
