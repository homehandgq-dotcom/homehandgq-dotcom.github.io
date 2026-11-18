import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * 人员头像组件：已上传真实照片时正常展示；未上传时使用统一风格的姓名首字母占位头像
 * （深海军蓝底 + 香槟金字），而非人物照片或编造的头像图片——真实照片可在后台
 * 「协会领导」编辑页随时补充上传（leadership_people.avatar_url）。
 */
export function PersonAvatar({
  src,
  name,
  className,
  textClassName,
  sizes,
}: {
  src?: string | null;
  name: string;
  className?: string;
  /** 未上传照片时占位首字母的字号，默认适配小尺寸头像；大尺寸头像（如详情弹窗）请传入更大的字号 */
  textClassName?: string;
  /** 传给 next/image 的 sizes 属性，默认适配小尺寸头像列表；大尺寸头像（如详情弹窗）请调大 */
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full bg-navy-50", className)}>
        <Image src={src} alt={name} fill sizes={sizes ?? "80px"} className="object-cover" />
      </div>
    );
  }

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-gold-300",
        className
      )}
      role="img"
      aria-label={name}
    >
      <span className={cn("font-bold tracking-wide", textClassName ?? "text-sm")}>{initials}</span>
    </div>
  );
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // 中文姓名：取首字符；英文/拉丁姓名：取每个词首字母（最多两个）
  const isCjk = /[一-鿿]/.test(trimmed);
  if (isCjk) return trimmed.slice(0, 1);
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
