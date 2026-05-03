import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetUserInfo extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Get user info by user_id (for permission check)",
		request: {
			query: z.object({
				user_id: z.string(),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id } = data.query;

		const row = await c.env.yifangyunzhi.prepare(
			"SELECT id, role FROM user WHERE id = ?"
		).bind(user_id).first<{ id: number; role: string | null }>();

		if (!row) return ok(c, null);

		let role: string[] = [];
		try {
			role = row.role ? JSON.parse(row.role) : [];
		} catch {
			role = [];
		}

		return ok(c, { id: row.id, role });
	}
}
