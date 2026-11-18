# 视觉设计系统 / Design System

## 色彩令牌（`tailwind.config.ts` 中定义）
```
navy:   50 #f4f6fa 100 #e6ebf3 200 #c3d0e3 300 #93a8c8 400 #5d7aa4
        500 #395680 600 #23406a 700 #16305a 800 #0f2347 900 #071B3A (主色)
gold:   50 #faf7f0 100 #f1e8d4 200 #e2d0a8 300 #d3b97e 400 #C7A574 (辅色)
        500 #b8925a 600 #9c7847 700 #7d5f39
ink:    900 #1a1d23（正文深灰黑）  600 #4b5261（次要文字）
surface: white #ffffff, mist #f5f7fa（极浅灰蓝背景）
```
禁止使用：多层渐变、荧光色、动效光晕、卡通插画风格图标。允许：细边框、克制阴影（`shadow-sm/md`）、金色作为强调线/图标/按钮描边，不作为大面积底色。

## 字体
- 英文：`Manrope`（标题）+ `Source Sans 3`（正文），通过 `next/font` 本地托管
- 中文：`Noto Sans SC`，通过 `next/font` 或自托管子集化字体
- 标题字重 600–700，字距略收紧；正文 400，行高 1.7（中文）/1.6（英文）

## 栅格与间距
- 容器最大宽度 1280px（`.container-arda`），左右内边距 24px（移动）→ 64px（桌面）
- 8px 基础间距刻度；Section 纵向间距 80–120px（桌面）/ 48–64px（移动）

## 组件规范要点
- **Sticky Header**：白底+细下边框，滚动后加阴影；Mega Menu 展开为全宽面板，含分栏与右侧特色新闻/活动卡片
- **按钮**：Primary（深海军蓝底/白字，hover 加深）、Secondary（金色描边/深蓝字）、Ghost；均有 `:disabled`、`:focus-visible` 状态（2px 金色 focus ring，满足 WCAG 可见焦点）
- **卡片**：白底、1px `navy-100` 边框、圆角 8px、hover 轻微上移+阴影
- **表单**：标签在上、输入框 44px 高（触屏友好）、错误态红边框+文字说明、成功态提示条
- **状态组件**：`Loading`(骨架屏)、`EmptyState`(图标+文案+可选 CTA)、`ErrorState`(重试按钮)

## 无障碍
- 色彩对比度均 ≥ WCAG AA；所有交互元素可键盘访问并有可见 focus；图片 alt 双语字段；表单 label 关联 `htmlFor`；跳转到主内容的 skip link。
