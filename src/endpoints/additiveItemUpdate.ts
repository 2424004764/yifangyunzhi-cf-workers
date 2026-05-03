import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class AdditiveItemUpdate extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveList"],
		summary: "Update an additive page",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({
				name: z.string().optional(), icon: z.string().optional(), effect: z.string().optional(),
				making_raw_materials: z.string().optional(), what: z.string().optional(),
				make: z.string().optional(), use_to: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const d = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE additive_list SET name = COALESCE(?, name), icon = COALESCE(?, icon), effect = COALESCE(?, effect), making_raw_materials = COALESCE(?, making_raw_materials), what = COALESCE(?, what), make = COALESCE(?, make), use_to = COALESCE(?, use_to), updated_on = ? WHERE id = ?"
		).bind(d.name ?? null, d.icon ?? null, d.effect ?? null, d.making_raw_materials ?? null, d.what ?? null, d.make ?? null, d.use_to ?? null, now, id).run();
		if (!result.meta.changes) return fail(c, "页面不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
