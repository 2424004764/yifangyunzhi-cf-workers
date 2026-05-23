import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class RandomGroupCreate extends OpenAPIRoute {
	schema = {
		tags: ["RandomSelect"],
		summary: "Create a random select group",
		request: {
			body: { content: { "application/json": { schema: z.object({ group_title: z.string() }) } } },
		},
	};

	async handle(c: AppContext) {
		const { group_title } = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const id = crypto.randomUUID().replace(/-/g, "");
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO random_select_group (id, user_id, group_title, created_on) VALUES (?, ?, ?, ?)"
		).bind(id, c.get("userId"), group_title, now).run();
		return ok(c, { id });
	}
}
