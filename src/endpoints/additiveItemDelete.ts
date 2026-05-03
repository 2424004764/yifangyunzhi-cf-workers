import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AdditiveItemDelete extends OpenAPIRoute {
	schema = {
		tags: ["AdditiveList"],
		summary: "Delete an additive page",
		request: { params: z.object({ id: z.string() }) },
	};

	async handle(c: AppContext) {
		const { id } = (await this.getValidatedData<typeof this.schema>()).params;
		const result = await c.env.yifangyunzhi.prepare("DELETE FROM additive_list WHERE id = ?").bind(id).run();
		return ok(c, { deleted: result.meta.changes });
	}
}
