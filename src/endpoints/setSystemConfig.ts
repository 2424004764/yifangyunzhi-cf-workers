import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class SetSystemConfig extends OpenAPIRoute {
	schema = {
		tags: ["System"],
		summary: "Set system configuration",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							config_key: z.string(),
							config_value: z.any(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { config_key, config_value } = data.body;

		const configValueStr = typeof config_value === 'object' ? JSON.stringify(config_value) : String(config_value);

		await c.env.yifangyunzhi.prepare(
			"INSERT OR REPLACE INTO system_config (config_key, config_value) VALUES (?, ?)"
		).bind(config_key, configValueStr).run();

		return ok(c, true);
	}
}