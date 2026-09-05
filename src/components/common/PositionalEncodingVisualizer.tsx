import React, { useState } from 'react';
import { Activity, Sliders, Sparkles, Layers, Info } from 'lucide-react';

export const PositionalEncodingVisualizer: React.FC = () => {
  const [selectedPos, setSelectedPos] = useState<number>(4);
  const [selectedDim, setSelectedDim] = useState<number>(0);

  const numPositions = 16;
  const dModel = 16; // 16 维特征

  // 计算 PE(pos, 2i) 或 PE(pos, 2i+1)
  const calcPE = (pos: number, d: number) => {
    const isEven = d % 2 === 0;
    const i = Math.floor(d / 2);
    const denominator = Math.pow(10000, (2 * i) / dModel);
    return isEven ? Math.sin(pos / denominator) : Math.cos(pos / denominator);
  };

  // 生成矩阵数据
  const matrix = Array.from({ length: numPositions }).map((_, p) =>
    Array.from({ length: dModel }).map((_, d) => calcPE(p, d))
  );

  // 波形图采样点 (计算当前 selectedDim 维度在 0 到 15 位置上的波形)
  const wavePoints: { x: number; y: number }[] = [];
  const svgWidth = 460;
  const svgHeight = 120;
  const padding = 20;

  for (let step = 0; step <= 100; step++) {
    const p = (step / 100) * (numPositions - 1);
    const val = calcPE(p, selectedDim);
    const x = padding + (step / 100) * (svgWidth - padding * 2);
    const y = svgHeight / 2 - val * (svgHeight / 2 - 15);
    wavePoints.push({ x, y });
  }

  const pathD = wavePoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // 当前选中采样点的坐标
  const currentVal = calcPE(selectedPos, selectedDim);
  const currentPtX = padding + (selectedPos / (numPositions - 1)) * (svgWidth - padding * 2);
  const currentPtY = svgHeight / 2 - currentVal * (svgHeight / 2 - 15);

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              正弦余弦位置编码 (Positional Encoding) 交互波形探索器
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            为什么不同位置拥有唯一的时空条形码？滑动滑块，实时观察不同频率波形与热力带交织的秘密！
          </p>
        </div>
      </div>

      {/* 控制滑块区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">序列位置 pos (第几个词):</span>
            <span className="font-mono text-indigo-400 font-bold text-sm">
              Token #{selectedPos}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={numPositions - 1}
            value={selectedPos}
            onChange={(e) => setSelectedPos(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">特征维度通道 dim (0 ~ {dModel - 1}):</span>
            <span className="font-mono text-purple-400 font-bold text-sm">
              Dim #{selectedDim} ({selectedDim % 2 === 0 ? '正弦 sin' : '余弦 cos'})
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={dModel - 1}
            value={selectedDim}
            onChange={(e) => setSelectedDim(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 实时动态连续波形图 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>
            通道 <strong>Dim #{selectedDim}</strong> 的连续波形采样曲线：
          </span>
          <span className="font-mono text-indigo-300">
            PE({selectedPos}, {selectedDim}) ={' '}
            <strong className="text-emerald-400 text-sm">{currentVal.toFixed(3)}</strong>
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* 中平基准线 */}
            <line
              x1={padding}
              y1={svgHeight / 2}
              x2={svgWidth - padding}
              y2={svgHeight / 2}
              stroke="#334155"
              strokeDasharray="2 2"
            />

            {/* 采样连续曲线 */}
            <path
              d={pathD}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 离散采样点标尺线 */}
            <line
              x1={currentPtX}
              y1={10}
              x2={currentPtX}
              y2={svgHeight - 10}
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* 当前选中采样圆点 */}
            <circle
              cx={currentPtX}
              cy={currentPtY}
              r="6"
              fill="#c084fc"
              stroke="#ffffff"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* 2D 位置编码矩阵热度图 (Pos x Dim) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>2D 编码矩阵条形码 (横轴为 16 维特征通道，纵轴为 16 个词语位置)：</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            左侧高频震荡 · 右侧低频平缓
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
          <div className="min-w-[420px] space-y-1">
            {matrix.map((row, pIdx) => {
              const isSelectedRow = pIdx === selectedPos;
              return (
                <div key={pIdx} className="flex items-center gap-1 text-[10px] font-mono">
                  <span
                    className={`w-10 text-right pr-1 shrink-0 ${
                      isSelectedRow ? 'text-indigo-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    pos {pIdx}
                  </span>

                  <div className="flex-1 flex gap-[2px]">
                    {row.map((val, dIdx) => {
                      const isSelectedCell = pIdx === selectedPos && dIdx === selectedDim;
                      // 映射颜色：-1 为深紫红，0 为暗灰，1 为亮青/绿
                      const norm = (val + 1) / 2; // 0 ~ 1
                      return (
                        <div
                          key={dIdx}
                          onClick={() => {
                            setSelectedPos(pIdx);
                            setSelectedDim(dIdx);
                          }}
                          title={`PE(pos=${pIdx}, dim=${dIdx}) = ${val.toFixed(3)}`}
                          className={`h-4 flex-1 rounded-[1.5px] cursor-pointer transition-all ${
                            isSelectedCell
                              ? 'ring-2 ring-white scale-125 z-10'
                              : 'hover:brightness-125'
                          }`}
                          style={{
                            backgroundColor:
                              val >= 0
                                ? `rgba(99, 102, 241, ${Math.max(0.15, val)})`
                                : `rgba(236, 72, 153, ${Math.max(0.15, Math.abs(val))})`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>核心洞察：</strong> 低维度通道（左边）波长极短，剧烈振荡，用来分辨“紧挨着的邻近词”；高维度通道（右边）波长极长，平缓变化，用来建立“长距离跨度的大体座标”。两者结合，使得任意两个位置的相对位移都能被内积感知！
        </p>
      </div>
    </div>
  );
};
