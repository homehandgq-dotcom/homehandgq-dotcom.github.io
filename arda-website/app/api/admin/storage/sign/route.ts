import { NextResponse } from "next/server";
import { assertPermission } from "@/lib/auth/admin";
import { getSignedUrl } from "@/lib/storage/signedUrl";

export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = new Set(["videos", "publications"]);
const PREVIEW_TTL_SECONDS = 60 * 30; // 后台预览签名有效期 30 分钟，够完成一次编辑/预览会话

/**
 * 后台「各界名人祝贺」「协会刊物」编辑页专用：为已上传但尚未发布（甚至永远不发布）
 * 的视频 / PDF / 封面图对象路径，临时签发一个管理员可用的签名 URL 以便预览。
 *
 * 权限校验：assertPermission('content.publish') —— 与这两个 Storage 桶的
 * insert/update RLS 策略要求的权限完全一致，保证"数据库权限"与"存储权限"双重把关：
 * 即使拿到了本接口的签名 URL，也必须是已登录且具备 content.publish 权限的管理员。
 */
export async function POST(request: Request) {
  let body: { bucket?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { bucket, path } = body;
  if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "无效的 bucket 或 path" }, { status: 400 });
  }

  try {
    await assertPermission("content.publish");
  } catch {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const url = await getSignedUrl(bucket, path, PREVIEW_TTL_SECONDS);
  if (!url) {
    return NextResponse.json({ error: "签名失败，请稍后重试" }, { status: 500 });
  }
  return NextResponse.json({ url });
}
