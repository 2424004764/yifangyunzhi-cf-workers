import { type AppContext } from "../types";

export async function handleFileGet(c: AppContext) {
  // 路由为 /files/*，从 URL 中提取 /files/ 之后的完整路径
  const url = new URL(c.req.url);
  const key = url.pathname.replace(/^\/files\//, "");
  if (!key) {
    return c.text("Missing key", 400);
  }

  const bucket = c.env.FILES_BUCKET;
  if (!bucket) {
    return c.text("R2 not configured", 500);
  }

  const obj = await bucket.get(key);
  if (!obj) {
    return c.text("Not found", 404);
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);

  return new Response(obj.body, {
    headers,
  });
}
