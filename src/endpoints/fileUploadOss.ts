import { type AppContext } from "../types";
import { ok, fail } from "../utils/response";

export async function handleFileUpload(c: AppContext) {
  console.log("[fileUpload] handler reached");

  const bucket = c.env.FILES_BUCKET;
  if (!bucket) {
    console.log("[fileUpload] R2 bucket not bound");
    return fail(c, "R2 not configured", 500);
  }
  console.log("[fileUpload] bucket OK");

  try {
    const body = await c.req.parseBody();
    console.log("[fileUpload] body parsed, keys:", Object.keys(body));

    const file = body.file;
    if (!file || !(file instanceof File)) {
      console.log("[fileUpload] no valid file in body, type:", typeof file, file);
      return fail(c, "No file uploaded", 400);
    }

    // 从请求中获取场景标识（如 anime-avatar、th-ideas），由客户端传入
    const scene = (body.scene as string) || "unknown";
    // 从 JWT 鉴权中间件获取用户 ID
    const userId = c.get("userId");
    // 当前日期作为子目录
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const name = file.name || "unknown";
    const ext = name.split(".").pop() || "bin";
    const key = `${userId}/${dateStr}/${scene}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = await file.arrayBuffer();

    console.log("[fileUpload] putting to R2, key:", key, "size:", buffer.byteLength);

    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        contentDisposition: `inline; filename="${encodeURIComponent(name)}"`,
      },
    });

    // 用请求自身的 origin 构造访问 URL，兼容本地和线上
    const reqUrl = new URL(c.req.url);
    const url = `${reqUrl.origin}/files/${key}`;
    console.log("[fileUpload] success, url:", url);
    return ok(c, { url, key });
  } catch (e: any) {
    console.error("[fileUpload] error:", e?.message || e, e?.stack);
    return fail(c, `上传失败: ${e?.message || e}`, 500);
  }
}
