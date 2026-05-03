import type { Context } from "hono";
import { z } from "zod";

export interface Env {
	WX_APPID: string;
	WX_SECRET: string;
	JWT_SECRET: string;
	BAIDU_API_KEY?: string;
	BAIDU_SECRET_KEY?: string;
	yifangyunzhi: D1Database;
	FILES_BUCKET?: R2Bucket;
	R2_PUBLIC_HOST?: string;
	LOCAL_PUBLIC_HOST?: string;
}

export type AppContext = Context<{
	Bindings: Env;
	Variables: {
		userId: string | number;
	};
}>;

export const Task = z.object({
	name: z.string().openapi({ example: "lorem" }),
	slug: z.string(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	due_date: z.string(),
});
