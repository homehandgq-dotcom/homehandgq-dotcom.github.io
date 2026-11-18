"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Heading2, Heading3, Undo, Redo, Loader2, AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-lg" },
      }),
      // 段落对齐：仅作用于普通段落与 H2/H3 标题（与工具栏已有的标题级别一致），
      // 存储为 text-align 行内样式，前台 RichText 组件直接渲染 HTML 即可保留对齐效果
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
        defaultAlignment: "left",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-arda min-h-[220px] px-4 py-3 focus:outline-none",
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  if (!editor) return <div className="input min-h-[220px]" />;

  function setLink() {
    const url = window.prompt("链接地址 URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function triggerImageUpload() {
    fileInputRef.current?.click();
  }

  // 上传并插入图片：复用 MediaUploadField 相同的 Supabase Storage 上传逻辑（media 桶），
  // 上传成功后在当前光标位置插入 <img>，不影响 cover_image / gallery 等其他字段
  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      editor?.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "图片上传失败，请稍后重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded border border-navy-200">
      <div className="flex flex-wrap items-center gap-1 border-b border-navy-100 bg-mist p-2">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-navy-200" />
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-navy-200" />
        <ToolBtn onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={triggerImageUpload} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          <span className="ml-1 text-xs font-semibold">{uploading ? "上传中…" : "上传并插入图片"}</span>
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <span className="mx-1 h-5 w-px bg-navy-200" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolBtn>
      </div>
      {uploadError && <p className="border-b border-navy-100 bg-red-50 px-3 py-1.5 text-xs text-red-600">{uploadError}</p>}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-100"
      }`}
    >
      {children}
    </button>
  );
}
