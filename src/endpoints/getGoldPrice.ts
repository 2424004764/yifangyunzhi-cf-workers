import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

// Parse Sina finance futures quote string (GB2312 encoded)
function parseSinaQuote(raw: string) {
	const match = raw.match(/"([^"]*)"/);
	if (!match) return null;
	const fields = match[1].split(",");

	return {
		price: parseFloat(fields[0]),
		prevClose: parseFloat(fields[1]),
		open: parseFloat(fields[2]),
		high: parseFloat(fields[4]),
		low: parseFloat(fields[5]),
		time: fields[6],
		date: fields[12],
		name: fields[13] || "",
	};
}

export class GetGoldPrice extends OpenAPIRoute {
	schema = {
		tags: ["Gold"],
		summary: "Get real-time gold spot price + E Fund Gold NAV",
	};

	async handle(c: AppContext) {
		try {
			const goldRes = await fetch(
				"https://hq.sinajs.cn/list=hf_XAU",
				{ headers: { Referer: "https://finance.sina.com.cn/" } }
			);
			const goldText = await goldRes.text();
			const gold = parseSinaQuote(goldText);

			if (!gold || isNaN(gold.price)) {
				return fail(c, "获取金价失败", 500);
			}

			// Live USD/CNY rate
			let usdCny = 7.25;
			try {
				const fxRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
				const fxJson = await fxRes.json() as { rates?: { CNY?: number } };
				if (fxJson.rates?.CNY) usdCny = fxJson.rates.CNY;
			} catch { /* fallback */ }

			const usdPerOz = gold.price;
			const cnyPerGramRaw = (usdPerOz / 31.1035) * usdCny;
			const cnyPerGram = Math.round(cnyPerGramRaw * 100) / 100;

			// E Fund Gold ETF (002963) NAV
			let fundNav: number | null = null;
			let fundDate: string | null = null;
			let fundChange: string | null = null;
			try {
				const fundRes = await fetch(
					"https://api.fund.eastmoney.com/f10/lsjz?fundCode=002963&pageIndex=1&pageSize=1",
					{ headers: { Referer: "https://fundf10.eastmoney.com/" } }
				);
				const fundJson = await fundRes.json() as {
					ErrCode?: number;
					Data?: { LSJZList?: Array<{ DWJZ: string; FSRQ: string; JZZZL: string }> };
				};
				if (fundJson.ErrCode === 0 && fundJson.Data?.LSJZList?.length) {
					fundNav = parseFloat(fundJson.Data.LSJZList[0].DWJZ);
					fundDate = fundJson.Data.LSJZList[0].FSRQ;
					fundChange = fundJson.Data.LSJZList[0].JZZZL;
				}
			} catch { /* ignore */ }

			// 存储金价到 gold_trend.gold_price
			try {
				const createdOn = new Date();
				const pad = (n: number) => String(n).padStart(2, "0");
				const createdOnStr = `${createdOn.getFullYear()}-${pad(createdOn.getMonth() + 1)}-${pad(createdOn.getDate())} ${pad(createdOn.getHours())}:${pad(createdOn.getMinutes())}:${pad(createdOn.getSeconds())}`;

				const existing = await c.env.yifangyunzhi.prepare(
					"SELECT id, gold_price FROM gold_trend WHERE ymd = ?"
				).bind(gold.date).first<{ id: string; gold_price: string | null }>();
				if (!existing) {
					const id = crypto.randomUUID().replace(/-/g, "");
					await c.env.yifangyunzhi.prepare(
						"INSERT INTO gold_trend (id, gold_price, ymd, created_on) VALUES (?, ?, ?, ?)"
					).bind(id, String(cnyPerGram), gold.date, createdOnStr).run();
				} else if (!existing.gold_price) {
					await c.env.yifangyunzhi.prepare(
						"UPDATE gold_trend SET gold_price = ?, created_on = ? WHERE ymd = ?"
					).bind(String(cnyPerGram), createdOnStr, gold.date).run();
				}
			} catch { /* 存储失败不影响返回 */ }

			return ok(c, {
				usd_per_ounce: usdPerOz,
				cny_per_gram: cnyPerGram,
				usd_cny_rate: usdCny,
				prev_close: gold.prevClose,
				open: gold.open,
				high: gold.high,
				low: gold.low,
				time: gold.time,
				date: gold.date,
				name: "伦敦金（现货黄金）",
				fund_nav: fundNav,
				fund_date: fundDate,
				fund_change_pct: fundChange,
			});
		} catch (e) {
			console.error("[getGoldPrice]", e);
			return fail(c, "获取金价失败", 500);
		}
	}
}
