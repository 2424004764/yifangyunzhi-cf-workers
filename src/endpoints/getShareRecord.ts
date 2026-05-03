import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetShareRecord extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Get a permission share record by id",
		request: {
			query: z.object({
				record_id: z.string(),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { record_id } = data.query;

		const row = await c.env.yifangyunzhi.prepare(
			"SELECT * FROM share_permission_record WHERE id = ?"
		).bind(record_id).first<{
			id: number;
			user_id: string;
			permission: string;
			expiration_seconds: number;
			create_date: number;
		}>();

		if (!row) return ok(c, null);

		let permission: string[] = [];
		try {
			permission = JSON.parse(row.permission);
		} catch {
			permission = [];
		}

		return ok(c, {
			id: row.id,
			user_id: row.user_id,
			permission,
			expiration_seconds: row.expiration_seconds,
			create_date: row.create_date,
		});
	}
}
