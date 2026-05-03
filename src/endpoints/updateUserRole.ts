import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class UpdateUserRole extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Update user role list",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							user_id: z.string(),
							role: z.array(z.string()),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id, role } = data.body;

		await c.env.yifangyunzhi.prepare(
			"UPDATE user SET role = ? WHERE id = ?"
		).bind(JSON.stringify(role), user_id).run();

		return ok(c, { updated: true });
	}
}
