import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { ok } from "../utils/response";

export class AnimeGroupCreate extends OpenAPIRoute {
	schema = { tags: ["Anime"], summary: "Create an anime generation group" };

	async handle(c: AppContext) {
		const id = crypto.randomUUID().replace(/-/g, "");
		const now = Math.floor(Date.now() / 1000);
		await c.env.yifangyunzhi.prepare(
			"INSERT INTO anime_gen_group (id, user_id, created_on, updated_on) VALUES (?, ?, ?, ?)"
		).bind(id, c.get("userId"), now, now).run();
		return ok(c, { id: id });
	}
}
