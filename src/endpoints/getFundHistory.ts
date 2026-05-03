import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export class GetFundHistory extends OpenAPIRoute {
	schema = {
		tags: ["Fund"],
		summary: "Query gold trend history from DB",
		request: { query: z.object({ days: z.coerce.number().optional().default(365) }) },
	};

	async handle(c: AppContext) {
		try {
			const { days } = (await this.getValidatedData<typeof this.schema>()).query;

			const rows = await c.env.yifangyunzhi.prepare(
				"SELECT net_worth, gold_price, ymd FROM gold_trend ORDER BY ymd DESC LIMIT ?"
			).bind(days).all<{ net_worth: string | null; gold_price: string | null; ymd: string }>();

			// 逆序成 ASC 供折线图使用
			const categories: string[] = [];
			const series_data: string[] = [];
			const gold_series_data: string[] = [];

			for (let i = rows.results.length - 1; i >= 0; i--) {
				const row = rows.results[i]!;
				categories.push(row.ymd);
				series_data.push(row.net_worth || "");
				gold_series_data.push(row.gold_price || "");
			}

			return ok(c, { categories, series_data, gold_series_data });
		} catch (e) {
			console.error("[getFundHistory]", e);
			return fail(c, "查询基金历史数据失败", 500);
		}
	}
}
