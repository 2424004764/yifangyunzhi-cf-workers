// 统一 HTTP 响应格式 { code, msg, data }

import type { Context } from "hono";
import type { AppContext } from "../types";

export const ok = (c: Context, data: unknown, msg = "ok") =>
	c.json({ code: 0, msg, data });

export const fail = (c: Context, msg: string, httpStatus: 400 | 401 | 403 | 404 | 500 = 400) =>
	c.json({ code: httpStatus, msg, data: null }, httpStatus);
