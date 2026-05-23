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
		const id = crypto.randomUUID().replace(/-/g, "");
		const now = Math.floor(Date.now() / 1000);
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO yfd_sell_price (id, user_id, yfd_sell_price, created_on) VALUES (?, ?, ?, ?)"
		).bind(id, c.get("userId"), yfd_sell_price, now).run();
		return ok(c, { id, yfd_sell_price, created_on: now });
	}
}
