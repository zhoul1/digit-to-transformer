import React, { useState } from 'react';
import { Compass, Sparkles, Play, RotateCcw, ArrowRight } from 'lucide-react';

interface WordPoint {
  id: string;
  name: string;
  x: number; // 归一化到 [-1, 1]
  y: number;
  category: 'royalty' | 'gender' | 'fruit' | 'tech';
  color: string;
}

const WORDS: WordPoint[] = [
  { id: 'king', name: '👑 国王', x: 0.65, y: 0.7, category: 'royalty', color: '#818cf8' },
  { id: 'queen', name: '👸 女王', x: 0.55, y: 0.25, category: 'royalty', color: '#c084fc' },
  { id: 'man', name: '👨 男人', x: 0.25, y: 0.75, category: 'gender', color: '#60a5fa' },
  { id: 'woman', name: '👩 女人', x: 0.15, y: 0.3, category: 'gender', color: '#f472b6' },
  { id: 'apple', name: '🍎 苹果', x: -0.65, y: 0.5, category: 'fruit', color: '#34d399' },
  { id: 'banana', name: '🍌 香蕉', x: -0.75, y: 0.2, category: 'fruit', color: '#a3e635' },
  { id: 'phone', name: '📱 手机', x: -0.4, y: -0.6, category: 'tech', color: '#f59e0b' },
  { id: 'chip', name: '💾 芯片', x: -0.6, y: -0.75, category: 'tech', color: '#fb923c' },
];

export const WordVectorSpaceVisualizer: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState<WordPoint | null>(WORDS[0]);
  const [showFormulaAnimation, setShowFormulaAnimation] = useState<boolean>(false);

  // 坐标系宽度与映射计算
  const width = 480;
  const height = 360;
  const padding = 40;

  const toSvgX = (x: number) => ((x + 1) / 2) * (width - padding * 2) + padding;
  const toSvgY = (y: number) => ((1 - y) / 2) * (height - padding * 2) + padding;

  const king = WORDS.find((w) => w.id === 'king')!;
  const man = WORDS.find((w) => w.id === 'man')!;
  const woman = WORDS.find((w) => w.id === 'woman')!;
  const queen = WORDS.find((w) => w.id === 'queen')!;

  // 模拟向量计算结果: king - man + woman
  const calcX = king.x - man.x + woman.x;
  const calcY = king.y - man.y + woman.y;

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              2D 词向量几何语义空间投影 (Word Vector Space)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            高维词嵌入映射到 2 维空间后，具有惊人的几何规律：语义相近的词距离更近，语义关系直接呈现为平行向量！
          </p>
        </div>

        {/* 向量计算演示触发按钮 */}
        <button
          onClick={() => setShowFormulaAnimation(!showFormulaAnimation)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            showFormulaAnimation
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showFormulaAnimation ? '重置几何空间' : '演示：国王 - 男人 + 女人 ≈ 女王'}</span>
        </button>
      </div>

      {/* 2D 坐标系画布 */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative w-full max-w-[480px] bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-inner">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              {/* 箭头标记 */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
              </marker>
              <marker
                id="arrow-sub"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
              </marker>
            </defs>

            {/* 网格虚线背景 */}
            {[-0.5, 0, 0.5].map((tick) => (
              <g key={tick}>
                <line
                  x1={toSvgX(tick)}
                  y1={padding}
                  x2={toSvgX(tick)}
                  y2={height - padding}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <line
                  x1={padding}
                  y1={toSvgY(tick)}
                  x2={width - padding}
                  y2={toSvgY(tick)}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
              </g>
            ))}

            {/* 坐标轴 */}
            <line
              x1={padding}
              y1={toSvgY(0)}
              x2={width - padding}
              y2={toSvgY(0)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={toSvgX(0)}
              y1={padding}
              x2={toSvgX(0)}
              y2={height - padding}
              stroke="#334155"
              strokeWidth="1.5"
            />

            <text x={width - padding + 5} y={toSvgY(0) + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
              语义维度 X
            </text>
            <text x={toSvgX(0) - 15} y={padding - 10} fill="#64748b" fontSize="10" fontFamily="monospace">
              语义维度 Y
            </text>

            {/* 向量算术连线展示 */}
            {showFormulaAnimation && (
              <g className="animate-fadeIn">
                {/* 男人 -> 女人 关系向量 (性别位移) */}
                <line
                  x1={toSvgX(man.x)}
                  y1={toSvgY(man.y)}
                  x2={toSvgX(woman.x)}
                  y2={toSvgY(woman.y)}
                  stroke="#f472b6"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrow)"
                />
                {/* 国王 -> 计算目标向量 (平移同等性别位移) */}
                <line
                  x1={toSvgX(king.x)}
                  y1={toSvgY(king.y)}
                  x2={toSvgX(calcX)}
                  y2={toSvgY(calcY)}
                  stroke="#c084fc"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow)"
                />

                {/* 投影合成点 */}
                <circle
                  cx={toSvgX(calcX)}
                  cy={toSvgY(calcY)}
                  r="7"
                  fill="#c084fc"
                  className="animate-pulse"
                />
                <text
                  x={toSvgX(calcX) + 10}
                  y={toSvgY(calcY) - 5}
                  fill="#e879f9"
                  fontSize="11"
                  fontWeight="bold"
                >
                  目标合成位置 ≈ 女王！
                </text>
              </g>
            )}

            {/* 渲染所有词点 */}
            {WORDS.map((w) => {
              const isSelected = selectedWord?.id === w.id;
              const sx = toSvgX(w.x);
              const sy = toSvgY(w.y);

              return (
                <g
                  key={w.id}
                  onClick={() => setSelectedWord(w)}
                  className="cursor-pointer transition-transform"
                >
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isSelected ? '9' : '6'}
                    fill={w.color}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="hover:scale-125 transition-all"
                  />
                  <text
                    x={sx + 8}
                    y={sy + 4}
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {w.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 右侧词向量属性与物理含义 */}
        <div className="flex-1 space-y-4 w-full text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="font-bold text-indigo-300 text-sm flex items-center gap-2">
              <span>当前选定词元:</span>
              <span className="text-white text-base">{selectedWord?.name}</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">坐标 X (抽象权力/尊贵度):</div>
                <div className="text-sm font-bold text-indigo-400 mt-0.5">
                  {selectedWord?.x.toFixed(2)}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">坐标 Y (性别/实体属性):</div>
                <div className="text-sm font-bold text-purple-400 mt-0.5">
                  {selectedWord?.y.toFixed(2)}
                </div>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              真实大模型中的词向量通常具有 <strong>768 ~ 4096 维</strong>。
              每一维可能对应着人类无法用肉眼直视的高维概念（如生命性、语法属性、时间性、情感偏向等）。
            </p>
          </div>

          {/* 向量公式说明卡片 */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-200 space-y-2">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>词向量代数运算公式 (Word2Vec / Embedding Arithmetic)</span>
            </div>
            <div className="font-mono p-2 rounded-lg bg-slate-950/80 border border-purple-500/20 text-center text-xs text-white">
              Vector("国王") - Vector("男人") + Vector("女人") ≈ Vector("女王")
            </div>
            <p className="text-slate-400">
              减去“男人”向量抹去了男性特征；加上“女人”向量注入了女性特征；而保留的“王室尊贵性”引导向量径直飞向“女王”！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
