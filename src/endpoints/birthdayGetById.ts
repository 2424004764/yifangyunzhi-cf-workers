import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";
import { computeBirthday } from "../utils/birthday";

function parseMoreField(v: unknown): unknown {
  if (!v || typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
}

export class BirthdayGetById extends OpenAPIRoute {
  schema = {
    tags: ["Birthday"],
    summary: "Get a birthday remark by id, with age/countdown computed",
    request: { params: z.object({ id: z.string() }) },
  };

  async handle(c: AppContext) {
    const { id } = (await this.getValidatedData<typeof this.schema>()).params;
    const row = await c.env.yifangyunzhi.prepare(
      "SELECT id, user_id, name, avatar, brithday_date, is_lunar_date, group_name, remark, more_field, created_on FROM brithday_remark WHERE id = ? AND user_id = ?"
    ).bind(id, c.get("userId")).first();
    if (!row) return fail(c, "记录不存在", 404);

    const info = computeBirthday(row.brithday_date, row.is_lunar_date);
    const more_field = parseMoreField(row.more_field);
    return ok(c, { ...row, more_field, ...info });
  }
}
