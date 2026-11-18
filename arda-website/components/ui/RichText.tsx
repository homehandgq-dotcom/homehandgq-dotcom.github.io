/**
 * 富文本内容渲染组件。
 * 内容来源于后台富文本编辑器（Tiptap），仅登录且拥有 content.publish 权限的管理员可写入，
 * 因此这里直接渲染 HTML。若未来开放更大范围的编辑者权限，建议接入 `isomorphic-dompurify`
 * 在服务端渲染前做一次白名单过滤，防止存储型 XSS。
 */
export function RichText({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  return <div className={`prose-arda ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
