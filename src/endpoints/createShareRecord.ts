import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class CreateShareRecord extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Create a permission share record",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							user_id: z.string(),
							permission: z.array(z.string()),
							expiration_seconds: z.number().default(0),
							create_date: z.number().optional(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id, permission, expiration_seconds, create_date } = data.body;

		const id = crypto.randomUUID().replace(/-/g, "");
		const now = create_date ?? Math.floor(Date.now() / 1000);

		await c.env.yifangyunzhi.prepare(
			"INSERT INTO share_permission_record (id, user_id, permission, expiration_seconds, create_date) VALUES (?, ?, ?, ?, ?)"
		).bind(id, user_id, JSON.stringify(permission), expiration_seconds, now).run();

		return ok(c, { id });
	}
}
