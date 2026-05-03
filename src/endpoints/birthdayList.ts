import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";
import { computeBirthday, type BirthdayInfo } from "../utils/birthday";

function parseMoreField(v: unknown): unknown {
  if (!v || typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
}

interface BirthdayRow {
  id: number;
  user_id: string;
  name: string;
  avatar: string | null;
  brithday_date: string;
  is_lunar_date: number;
  group_name: string | null;
  remark: string | null;
  more_field: unknown;
  created_on: number;
}

interface BirthdayItem extends BirthdayRow, BirthdayInfo {}

export class BirthdayList extends OpenAPIRoute {
  schema = {
    tags: ["Birthday"],
    summary: "List birthdays sorted by upcoming, with age/countdown computed",
    request: { query: z.object({ group: z.string().optional() }) },
  };

  async handle(c: AppContext) {
    const { group } = (await this.getValidatedData<typeof this.schema>()).query;
    const userId = c.get("userId");

    let sql = "SELECT id, user_id, name, avatar, brithday_date, is_lunar_date, group_name, remark, more_field, created_on FROM brithday_remark WHERE user_id = ?";
    const binds: Array<unknown> = [userId];
    if (group) { sql += " AND group_name = ?"; binds.push(group); }
    sql += " ORDER BY created_on DESC";

    const { results } = await c.env.yifangyunzhi.prepare(sql).bind(...binds).all<BirthdayRow>();
    const now = new Date();

    const list: BirthdayItem[] = [];
    for (const row of results) {
      try {
        const info = computeBirthday(row.brithday_date, row.is_lunar_date, now);
        const more_field = parseMoreField(row.more_field);
        list.push({ ...row, more_field, ...info });
      } catch {
        list.push({ ...row, more_field: null, age: 0, next_date: "", days_left: 99999, is_today: false });
      }
    }

    // Sort by days_left ascending; birthdays that are today come first
    // For lunar dates that might overflow, days_left stays accurate relative to today
    list.sort((a, b) => a.days_left - b.days_left);

    return ok(c, { list, total: list.length });
  }
}
