import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class AdditiveItemGet extends OpenAPIRoute {
  schema = {
    tags: ["AdditiveList"],
    summary: "Get a single additive page by id",
    request: { params: z.object({ id: z.string() }) },
  };

  async handle(c: AppContext) {
    const { id } = (await this.getValidatedData<typeof this.schema>()).params;
    const row = await c.env.yifangyunzhi.prepare(
      "SELECT * FROM additive_list WHERE id = ?"
    ).bind(id).first();
    if (!row) return fail(c, "记录不存在", 404);
    return ok(c, row);
  }
}
