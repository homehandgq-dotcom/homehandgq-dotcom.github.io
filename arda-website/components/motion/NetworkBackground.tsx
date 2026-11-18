// 「全球网络」风格装饰层：缓慢闪烁的节点 + 缓慢流动的连线。
// 纯 SVG + CSS 关键帧驱动（见 app/globals.css 中 .arda-network-node / .arda-network-line），
// 不引入额外 JS 动画开销；关键帧本身已在 prefers-reduced-motion 中统一关闭。
// 用作绝对定位的装饰层，父元素需设置 position: relative + overflow: hidden。

const NODES = [
  { cx: 60, cy: 40, delay: "0s" },
  { cx: 220, cy: 90, delay: "0.4s" },
  { cx: 380, cy: 30, delay: "0.8s" },
  { cx: 520, cy: 110, delay: "1.1s" },
  { cx: 680, cy: 50, delay: "1.6s" },
  { cx: 820, cy: 100, delay: "0.6s" },
  { cx: 960, cy: 45, delay: "1.3s" },
];

const LINKS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [1, 3],
  [3, 5],
];

export function NetworkBackground({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 140"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {LINKS.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].cx}
          y1={NODES[a].cy}
          x2={NODES[b].cx}
          y2={NODES[b].cy}
          className="arda-network-line"
          stroke="rgba(199,165,116,0.45)"
          strokeWidth={1}
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={3.5}
          fill="rgba(127,184,245,0.85)"
          className="arda-network-node"
          style={{ animationDelay: n.delay }}
        />
      ))}
    </svg>
  );
}
