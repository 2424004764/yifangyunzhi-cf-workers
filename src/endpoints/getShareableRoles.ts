import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetShareableRoles extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Get all shareable roles",
	};

	async handle(c: AppContext) {
		const rows = await c.env.yifangyunzhi.prepare(
			"SELECT role_id, role_name, comment FROM roles WHERE is_shareable = 1"
		).all<{ role_id: string; role_name: string; comment: string }>();

		return ok(c, rows.results);
	}
}
