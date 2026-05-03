import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class GetSystemConfigByGet extends OpenAPIRoute {
	schema = {
		tags: ["System"],
		summary: "Get system configuration (GET)",
		request: {
			query: z.object({
				config_key: z.string(),
			}),
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { config_key } = data.query;

		const result = await c.env.yifangyunzhi.prepare(
			"SELECT config_key, config_value FROM system_config WHERE config_key = ?"
		).bind(config_key).first();

		if (!result) {
			return ok(c, []);
		}

		let config_value;
		try {
			config_value = JSON.parse(result.config_value as string);
		} catch {
			config_value = result.config_value;
		}

		return ok(c, [{ config_key: result.config_key, config_value }]);
	}
}
