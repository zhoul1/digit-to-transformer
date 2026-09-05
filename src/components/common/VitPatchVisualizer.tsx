import React, { useState } from 'react';
import { Sparkles, Grid3X3, ArrowDown, ArrowRight, Eye } from 'lucide-react';
import { DIGIT_PRESETS } from '../../utils/mnistModel';

export const VitPatchVisualizer: React.FC = () => {
  const [selectedDigit, setSelectedDigit] = useState<number>(8);
  const [hoveredPatchIdx, setHoveredPatchIdx] = useState<number | null>(null);

  // 28x28 矩阵切分为 4x4 个 7x7 patch
  const grid = DIGIT_PRESETS[selectedDigit] || DIGIT_PRESETS[8];
  const patchRows = 4;
  const patchCols = 4;
  const patchSize = 7; // 7x7 = 49 像素

  // 生成 16 个 patch 数据
  const patches = Array.from({ length: 16 }).map((_, patchIdx) => {
    const pr = Math.floor(patchIdx / patchCols);
    const pc = patchIdx % patchCols;
    const pixels: number[] = [];

    for (let r = 0; r < patchSize; r++) {
      for (let c = 0; c < patchSize; c++) {
        const origR = pr * patchSize + r;
        const origC = pc * patchSize + c;
        pixels.push(grid[origR][origC] || 0);
      }
    }
    const avgBrightness = pixels.reduce((a, b) => a + b, 0) / pixels.length;
    return { patchIdx, pr, pc, pixels, avgBrightness };
  });

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Grid3X3 className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              ViT (Vision Transformer) 揭秘：图像如何变序列？
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            谁说 Transformer 只能读文字？把 28×28 的图像切成 16 个小方块 (Patch)，每个方块就是一个“视觉词 (Token)”！
          </p>
        </div>

        {/* 预设数字切换 */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">切换测试数字:</span>
          {[0, 3, 7, 8].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDigit(d)}
              className={`w-7 h-7 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                selectedDigit === d
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 主展示区：左侧 2D 切片网格，右侧 1D Token 序列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* 左侧：带切片边界的 28x28 图像 */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>28×28 原始图像（切分成 4×4 = 16 个 7×7 Patch）</span>
          </span>

          <div className="relative p-2 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl">
            {/* 16 个 Patch 网格 */}
            <div className="grid grid-cols-4 gap-1.5">
              {patches.map((p) => {
                const isHovered = hoveredPatchIdx === p.patchIdx;
                return (
                  <div
                    key={p.patchIdx}
                    onMouseEnter={() => setHoveredPatchIdx(p.patchIdx)}
                    onMouseLeave={() => setHoveredPatchIdx(null)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg p-0.5 grid grid-cols-7 gap-[0.5px] border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-105 z-10 bg-indigo-950/40 shadow-xl'
                        : 'border-slate-800 hover:border-slate-600 bg-slate-900/60'
                    }`}
                  >
                    {p.pixels.map((val, pxIdx) => (
                      <div
                        key={pxIdx}
                        className="rounded-[0.5px]"
                        style={{
                          backgroundColor:
                            val > 0.05
                              ? `rgba(255, 255, 255, ${Math.min(1, val * 1.2 + 0.15)})`
                              : '#070b14',
                        }}
                      />
                    ))}

                    <span
                      className={`absolute top-0.5 left-0.5 text-[9px] font-mono px-1 rounded ${
                        isHovered ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-950/70 text-slate-400'
                      }`}
                    >
                      P{p.patchIdx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            👉 将鼠标悬停在上方任意 Patch 小方格上，查看其在一维序列中的对应 Token！
          </span>
        </div>

        {/* 右侧：展平后的 1D Token 序列 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
            <ArrowRight className="w-4 h-4 hidden md:block" />
            <ArrowDown className="w-4 h-4 md:hidden" />
            <span>展平成 16 个 Token 的“视觉句子” (Sequence of Tokens)</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {patches.map((p) => {
                const isHovered = hoveredPatchIdx === p.patchIdx;
                return (
                  <div
                    key={p.patchIdx}
                    onMouseEnter={() => setHoveredPatchIdx(p.patchIdx)}
                    onMouseLeave={() => setHoveredPatchIdx(null)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg scale-105'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold text-indigo-400">
                      Token #{p.patchIdx + 1}
                    </div>
                    <div className="text-[11px] font-bold text-slate-200 mt-0.5">
                      {p.avgBrightness > 0.15 ? '含有笔画' : '纯黑背景'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      dim=49
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 选中 Token 的向量特征详情 */}
            <div className="pt-3 border-t border-slate-800/80 text-xs space-y-1">
              {hoveredPatchIdx !== null ? (
                <div className="text-slate-300">
                  <span className="font-bold text-indigo-400">
                    Token #{hoveredPatchIdx + 1} 详情：
                  </span>
                  <span className="text-slate-400 ml-2">
                    位置座标: ({patches[hoveredPatchIdx].pr}, {patches[hoveredPatchIdx].pc}) · 展开为 49 维像素向量 + 位置编码 PE({hoveredPatchIdx + 1})
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 text-[11px]">
                  💡 <strong>启示：</strong> 在 Vision Transformer 看来，一张画了数字 8 的图片，和一首包含 16 个汉字的绝句没有本质区别！
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
