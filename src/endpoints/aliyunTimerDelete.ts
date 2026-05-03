import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AliyunTimerDelete extends OpenAPIRoute {
	schema = {
		tags: ["Aliyun"],
		summary: "Delete expired temp file records",
	};

	async handle(c: AppContext) {
		const now = Math.floor(Date.now() / 1000);

		const result = await c.env.yifangyunzhi.prepare(
			"DELETE FROM upload_file_temp WHERE expiration_time < ?"
		).bind(now).run();

		return ok(c, { deleted: result.meta.changes });
	}
}
