import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../types";
import { fail } from "../utils/response";
import { verifyJWT } from "../utils/jwt";

// 无需鉴权的公开接口（method + 路径前缀），客户端通过 noAuth: true 调用
const PUBLIC_ROUTES: { method: string; prefix: string }[] = [
	{ method: "GET", prefix: "/api/permissions/shareable-roles" },
	{ method: "GET", prefix: "/api/permissions/share-record" },
];

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	// 公开接口跳过鉴权
	const url = new URL(c.req.url);
	const method = c.req.method;
	for (const route of PUBLIC_ROUTES) {
		if (
			route.method === method &&
			(url.pathname === route.prefix || url.pathname.startsWith(route.prefix + "/"))
		) {
			await next();
			return;
		}
	}

	const authHeader =
		c.req.header("authorization") ??
		c.req.header("Authorization") ??
		c.req.raw.headers.get("authorization");

	let token: string | null = null;
	if (authHeader) {
		token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
	}

	if (!token) {
		return fail(c, "Unauthorized", 401);
	}

	try {
		const payload = await verifyJWT(token, c.env.JWT_SECRET);
		const uid = payload.id;
		if (typeof uid !== "string" && typeof uid !== "number") {
			return fail(c, "Unauthorized", 401);
		}
		c.set("userId", uid);
		await next();
	} catch (e) {
		console.error("[auth] verify failed:", e);
		return fail(c, "Unauthorized", 401);
	}
};
