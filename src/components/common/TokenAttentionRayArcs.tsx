import React from 'react';
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface TokenAttentionRayArcsProps {
  tokens: string[];
  attentionWeights: number[][];
  focusedIdx: number;
  onSelectFocus: (idx: number) => void;
  useCausalMask: boolean;
}

export const TokenAttentionRayArcs: React.FC<TokenAttentionRayArcsProps> = ({
  tokens,
  attentionWeights,
  focusedIdx,
  onSelectFocus,
  useCausalMask,
}) => {
  const n = tokens.length;
  const svgWidth = 640;
  const svgHeight = 170;
  const bottomY = 145;

  // 计算每个 Token 在 SVG 中的中心 X 座标
  const getX = (idx: number) => {
    const padding = 45;
    const available = svgWidth - padding * 2;
    return padding + (idx / (n - 1 || 1)) * available;
  };

  const currentWeights = attentionWeights[focusedIdx] || Array(n).fill(1 / n);

  return (
    <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
            注意力光束弧线动态透视 (Token Attention Ray Arcs)
          </h4>
        </div>
        <div className="text-[11px] text-slate-400">
          当前以 <strong className="text-indigo-400">"{tokens[focusedIdx]}"</strong> (Token #{focusedIdx}) 为 Query 观察全句注意力流向
        </div>
      </div>

      {/* SVG 弧线连接画布 */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[520px] h-auto select-none"
        >
          <defs>
            <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* 渲染所有注意力光束弧线 */}
          {tokens.map((_, targetIdx) => {
            const isMasked = useCausalMask && targetIdx > focusedIdx;
            const w = currentWeights[targetIdx] || 0;
            const x1 = getX(focusedIdx);
            const x2 = getX(targetIdx);

            if (isMasked) {
              // 被因果掩码遮蔽的连接线（虚线灰显）
              return (
                <g key={`masked-${targetIdx}`} opacity="0.3">
                  <path
                    d={`M ${x1} ${bottomY - 10} Q ${(x1 + x2) / 2} ${bottomY - 40} ${x2} ${bottomY - 10}`}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={bottomY - 45}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="sans-serif"
                  >
                    🔒 Masked
                  </text>
                </g>
              );
            }

            if (focusedIdx === targetIdx) {
              // 自注意力回路 (Self-Attention Loop)
              const loopR = Math.max(12, Math.min(28, w * 40));
              return (
                <g key={`self-${targetIdx}`}>
                  <circle
                    cx={x1}
                    cy={bottomY - 18 - loopR}
                    r={loopR}
                    fill="none"
                    stroke="url(#arcGlow)"
                    strokeWidth={Math.max(1.5, w * 8)}
                    opacity={Math.max(0.4, w * 1.5)}
                  />
                  <text
                    x={x1}
                    y={bottomY - 22 - loopR * 2}
                    textAnchor="middle"
                    fill="#a7f3d0"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {(w * 100).toFixed(0)}%
                  </text>
                </g>
              );
            }

            // 跨词贝塞尔弧线
            const dist = Math.abs(targetIdx - focusedIdx);
            const arcPeakHeight = Math.min(100, 30 + dist * 16);
            const midX = (x1 + x2) / 2;
            const ctrlY = bottomY - arcPeakHeight;

            const strokeW = Math.max(1.5, w * 9);
            const strokeOpacity = Math.max(0.25, Math.min(1.0, w * 1.4));
            const strokeColor = w > 0.35 ? '#34d399' : w > 0.15 ? '#818cf8' : '#64748b';

            return (
              <g key={`arc-${targetIdx}`}>
                {/* 弧线本身 */}
                <path
                  d={`M ${x1} ${bottomY - 12} Q ${midX} ${ctrlY} ${x2} ${bottomY - 12}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  opacity={strokeOpacity}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* 弧线最高点的百分比权重标签 */}
                <rect
                  x={midX - 16}
                  y={ctrlY - 14}
                  width="32"
                  height="16"
                  rx="4"
                  fill="#0b0f19"
                  stroke={strokeColor}
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x={midX}
                  y={ctrlY - 3}
                  textAnchor="middle"
                  fill={strokeColor}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {(w * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* 渲染底部 Token 节点 */}
          {tokens.map((token, idx) => {
            const isFocused = idx === focusedIdx;
            const x = getX(idx);
            const weight = currentWeights[idx] || 0;

            return (
              <g
                key={`token-${idx}`}
                onClick={() => onSelectFocus(idx)}
                className="cursor-pointer group"
              >
                {/* 聚焦光环 */}
                {isFocused && (
                  <circle
                    cx={x}
                    cy={bottomY + 5}
                    r="20"
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}

                {/* Token 底座小圆圈 */}
                <circle
                  cx={x}
                  cy={bottomY + 5}
                  r="14"
                  fill={isFocused ? '#4f46e5' : '#1e293b'}
                  stroke={isFocused ? '#a5b4fc' : '#475569'}
                  strokeWidth="1.5"
                  className="group-hover:scale-110 transition-transform"
                />

                {/* 词文本 */}
                <text
                  x={x}
                  y={bottomY + 9}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {token}
                </text>

                {/* 索引号 */}
                <text
                  x={x}
                  y={bottomY - 14}
                  textAnchor="middle"
                  fill={isFocused ? '#818cf8' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  #{idx}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
        <span>💡 点击上方任意 Token 切换观察源，光束粗细代表该词将多少注意力投放给对方。</span>
        <span className="text-emerald-400 font-mono">百分比总和: 100%</span>
      </div>
    </div>
  );
};
