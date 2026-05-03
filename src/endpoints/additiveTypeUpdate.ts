import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class AdditiveTypeUpdate extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveType"],
		summary: "Update an additive type",
		request: {
			params: z.object({ id: z.string() }),
			body: { content: { "application/json": { schema: z.object({
				name: z.string().optional(), desc: z.string().optional(), type: z.string().optional(),
			}) } } },
		},
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const { name, desc, type } = (await this.getValidatedData<typeof this.schema>()).body;
		const now = Math.floor(Date.now() / 1000);
		const result = await c.env.yifangyunzhi.prepare(
			"UPDATE additive_type SET name = COALESCE(?, name), desc = COALESCE(?, desc), type = COALESCE(?, type), onenote_id = COALESCE(?, onenote_id), updated_on = ? WHERE id = ?"
		).bind(name ?? null, desc ?? null, type ?? null, type ?? null, now, id).run();
		if (!result.meta.changes) return fail(c, "分区不存在", 404);
		return ok(c, { updated: result.meta.changes });
	}
}
