import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveTypeCreate extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveType"],
		summary: "Create an additive type",
		request: {
			body: { content: { "application/json": { schema: z.object({
				type: z.string(), name: z.string(), desc: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { type, name, desc } = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const id = crypto.randomUUID().replace(/-/g, "");
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO additive_type (id, onenote_id, name, desc, type, created_on, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?)"
		).bind(id, type, name, desc ?? null, type, now, now).run();
		return ok(c, { id });
	}
}
