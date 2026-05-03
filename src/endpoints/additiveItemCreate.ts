import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveItemCreate extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveList"],
		summary: "Create an additive page",
		request: {
			body: { content: { "application/json": { schema: z.object({
				type_id: z.coerce.string(), type: z.string(), name: z.string(),
				icon: z.string().optional(), effect: z.string().optional(),
				making_raw_materials: z.string().optional(), what: z.string().optional(),
				make: z.string().optional(), use_to: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const id = crypto.randomUUID().replace(/-/g, "");
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO additive_list (id, type_id, type, name, icon, effect, making_raw_materials, what, make, use_to, created_on, updated_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
		).bind(id, d.type_id, d.type, d.name, d.icon ?? null, d.effect ?? null, d.making_raw_materials ?? null, d.what ?? null, d.make ?? null, d.use_to ?? null, now, now).run();
		return ok(c, { id });
	}
}
