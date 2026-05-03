import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveTypeDelete extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveType"],
		summary: "Delete an additive type and cascade delete pages",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		await c.env.yifangyunzhi.prepare("DELETE FROM additive_list WHERE type_id = ?").bind(id).run();
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM additive_type WHERE id = ?").bind(id).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
