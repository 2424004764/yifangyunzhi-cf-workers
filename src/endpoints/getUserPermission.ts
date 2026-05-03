import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetUserPermission extends OpenAPIRoute {
	schema = {
		tags: ["Permissions"],
		summary: "Get user permissions by user_id",
		request: {
			query: z.object({
				user_id: z.string(),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id } = data.query;

		const userRow = await c.env.yifangyunzhi.prepare(
			"SELECT role FROM user WHERE id = ?"
		).bind(user_id).first<{ role: string | null }>();

		if (!userRow) {
			return ok(c, { role: [], permission_list: [], role_list: [] });
		}

		let role: string[] = [];
		try {
			role = userRow.role ? JSON.parse(userRow.role) : [];
		} catch {
			role = [];
		}

		if (!role.length) {
			return ok(c, { role, permission_list: [], role_list: [] });
		}

		const placeholders = role.map(() => "?").join(",");
		const roleRows = await c.env.yifangyunzhi.prepare(
			`SELECT role_id, role_name, permission FROM roles WHERE role_id IN (${placeholders})`
		).bind(...role).all<{ role_id: string; role_name: string; permission: string }>();

		const role_list = roleRows.results.map(r => ({
			role_id: r.role_id,
			role_name: r.role_name,
			permission: (() => {
				try { return JSON.parse(r.permission); } catch { return []; }
			})(),
		}));

		const permission_list: number[] = [];
		for (const r of role_list) {
			for (const p of r.permission) {
				if (!permission_list.includes(p)) permission_list.push(p);
			}
		}

		return ok(c, { role, permission_list, role_list });
	}
}
