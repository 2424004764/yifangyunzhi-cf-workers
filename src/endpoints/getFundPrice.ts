import { OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

function makeId() {
	return crypto.randomUUID().replace(/-/g, "");
}

function nowStr() {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export class GetFundPrice extends OpenAPIRoute {
	schema = {
		tags: ["Fund"],
		summary: "Crawl gold fund NAV and spot gold price from eastmoney, store to DB",
	};

	async handle(c: AppContext) {
		try {
			// 1. 爬取基金净值 (002963)
			const res = await fetch(
				"https://api.fund.eastmoney.com/f10/lsjz?fundCode=002963&pageIndex=1&pageSize=1",
				{ headers: { Referer: "https://fundf10.eastmoney.com/" } }
			);
			const json = await res.json() as { Data?: { LSJZList?: Array<{ DWJZ: string; FSRQ: string }> }; ErrCode?: number };
			if (json.ErrCode !== 0 || !json.Data?.LSJZList?.length) {
				return fail(c, "获取基金净值失败", 500);
			}

			const latest = json.Data.LSJZList[0]!;
			const netWorth = latest.DWJZ;
			const ymd = latest.FSRQ;

			// 2. 爬取金价 (伦敦金 XAU/USD → CNY/克)
			let goldPrice: string | null = null;
			try {
				const goldRes = await fetch(
					"https://hq.sinajs.cn/list=hf_XAU",
					{ headers: { Referer: "https://finance.sina.com.cn/" } }
				);
				const goldText = await goldRes.text();
				const match = goldText.match(/"([^"]*)"/);
				if (match) {
					const fields = match[1].split(",");
					const usdPerOz = parseFloat(fields[0]);
					if (!isNaN(usdPerOz)) {
						let usdCny = 7.25;
						try {
							const fxRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
							const fxJson = await fxRes.json() as { rates?: { CNY?: number } };
							if (fxJson.rates?.CNY) usdCny = fxJson.rates.CNY;
						} catch { /* fallback */ }
						const cnyPerGram = Math.round((usdPerOz / 31.1035) * usdCny * 100) / 100;
						goldPrice = String(cnyPerGram);
					}
				}
			} catch (e) {
				console.error("[getFundPrice] gold spot error", e);
			}

			// 3. 写入 gold_trend
			const existing = await c.env.yifangyunzhi.prepare(
				"SELECT id FROM gold_trend WHERE ymd = ?"
			).bind(ymd).first<{ id: string }>();

			let rowId: string | null = null;
			const createdOn = nowStr();
			if (!existing) {
				rowId = makeId();
				await c.env.yifangyunzhi.prepare(
					"INSERT INTO gold_trend (id, net_worth, gold_price, ymd, created_on) VALUES (?, ?, ?, ?, ?)"
				).bind(rowId, netWorth, goldPrice, ymd, createdOn).run();
			} else {
				rowId = existing.id;
				if (netWorth) {
					await c.env.yifangyunzhi.prepare(
						"UPDATE gold_trend SET net_worth = ?, created_on = ? WHERE ymd = ? AND net_worth IS NULL"
					).bind(netWorth, createdOn, ymd).run();
				}
				if (goldPrice) {
					await c.env.yifangyunzhi.prepare(
						"UPDATE gold_trend SET gold_price = ?, created_on = ? WHERE ymd = ? AND gold_price IS NULL"
					).bind(goldPrice, createdOn, ymd).run();
				}
			}

			return ok(c, { id: rowId, net_worth: netWorth, gold_price: goldPrice, ymd, created_on: createdOn });
		} catch (e) {
			console.error("[getFundPrice]", e);
			return fail(c, "获取基金净值失败", 500);
		}
	}
}
