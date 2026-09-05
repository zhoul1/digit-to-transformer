import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, GitCommit, Sparkles, RefreshCw, Layers } from 'lucide-react';

export const ChainRuleVisualizer: React.FC = () => {
  const [x, setX] = useState<number>(2.0);
  const [w, setW] = useState<number>(1.5);
  const [targetY, setTargetY] = useState<number>(1.0);
  const [actType, setActType] = useState<'sigmoid' | 'relu' | 'square'>('sigmoid');
  const [showBackward, setShowBackward] = useState<boolean>(true);
  const [highlightNode, setHighlightNode] = useState<string | null>(null);

  // 1. 前向传播计算
  const z = w * x; // 线性层输出

  let a = 0; // 激活后输出
  let dadz = 0; // da / dz
  if (actType === 'sigmoid') {
    a = 1 / (1 + Math.exp(-z));
    dadz = a * (1 - a);
  } else if (actType === 'relu') {
    a = Math.max(0, z);
    dadz = z > 0 ? 1 : 0;
  } else {
    a = z * z;
    dadz = 2 * z;
  }

  // 损失: L = 0.5 * (a - y)^2
  const loss = 0.5 * Math.pow(a - targetY, 2);

  // 2. 反向传播计算 (链式法则)
  const dlda = a - targetY; // dL / da
  const dldz = dlda * dadz; // dL / dz = (dL/da) * (da/dz)
  const dzdw = x; // dz / dw = x
  const dzdx = w; // dz / dx = w
  const dldw = dldz * dzdw; // dL / dw = (dL/dz) * (dz/dw)
  const dldx = dldz * dzdx; // dL / dx

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              交互实验 3
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              链式法则与反向传播计算图 (Chain Rule & Backprop Graph)
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            深度学习的反向传播本质就是微积分复合函数求导的链式法则：梯度从 Loss 倒流回每个参数。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBackward(!showBackward)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
              showBackward
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {showBackward ? '反向梯度倒流已开启' : '查看反向传播 (梯度流动)'}
          </button>
        </div>
      </div>

      {/* 参数输入与激活函数选择 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs text-slate-400 block mb-1">输入特征 $x$</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={x}
              onChange={(e) => setX(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="font-mono text-cyan-300 font-bold text-sm w-10 text-right">{x.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">网络权重 $w$</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={w}
              onChange={(e) => setW(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="font-mono text-indigo-300 font-bold text-sm w-10 text-right">{w.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">目标真值 $y$ (Ground Truth)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={targetY}
              onChange={(e) => setTargetY(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="font-mono text-amber-300 font-bold text-sm w-10 text-right">{targetY.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">激活函数 $\sigma$</label>
          <div className="flex gap-1">
            {(['sigmoid', 'relu', 'square'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActType(type)}
                className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-all ${
                  actType === type
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 计算图可视化 (SVG 流程图) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 overflow-x-auto">
        <div className="min-w-[660px] flex flex-col items-center">
          <div className="relative w-full max-w-2xl py-4">
            {/* 节点水平连线流程 */}
            <div className="flex items-center justify-between relative z-10">
              {/* 输入节点 x & 权重节点 w */}
              <div className="flex flex-col gap-4">
                <div
                  onMouseEnter={() => setHighlightNode('x')}
                  onMouseLeave={() => setHighlightNode(null)}
                  className={`w-28 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    highlightNode === 'x'
                      ? 'bg-cyan-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400'
                  }`}
                >
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase">输入 (Input)</div>
                  <div className="text-base font-bold text-white font-mono">x = {x.toFixed(1)}</div>
                  {showBackward && (
                    <div className="mt-1 text-[11px] text-rose-400 font-mono border-t border-slate-800 pt-1">
                      ∂L/∂x = {dldx.toFixed(3)}
                    </div>
                  )}
                </div>

                <div
                  onMouseEnter={() => setHighlightNode('w')}
                  onMouseLeave={() => setHighlightNode(null)}
                  className={`w-28 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    highlightNode === 'w'
                      ? 'bg-indigo-950 border-indigo-400 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400'
                  }`}
                >
                  <div className="text-[10px] text-indigo-400 font-semibold uppercase">权重 (Weight)</div>
                  <div className="text-base font-bold text-white font-mono">w = {w.toFixed(1)}</div>
                  {showBackward && (
                    <div className="mt-1 text-[11px] text-rose-400 font-mono font-bold border-t border-slate-800 pt-1">
                      ∂L/∂w = {dldw.toFixed(3)}
                    </div>
                  )}
                </div>
              </div>

              {/* 箭头指向 z */}
              <div className="flex flex-col items-center px-2">
                <div className="text-[10px] text-slate-500 font-mono">z = w · x</div>
                <ArrowRight className="w-5 h-5 text-slate-500 my-1" />
                {showBackward && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>× dz/dw</span>
                  </div>
                )}
              </div>

              {/* 线性求和节点 z */}
              <div
                onMouseEnter={() => setHighlightNode('z')}
                onMouseLeave={() => setHighlightNode(null)}
                className={`w-28 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  highlightNode === 'z'
                    ? 'bg-blue-950 border-blue-400 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900/90 border-blue-500/40 hover:border-blue-400'
                }`}
              >
                <div className="text-[10px] text-blue-400 font-semibold uppercase">线性节点 (z)</div>
                <div className="text-base font-bold text-white font-mono">z = {z.toFixed(2)}</div>
                {showBackward && (
                  <div className="mt-1 text-[11px] text-rose-400 font-mono border-t border-slate-800 pt-1">
                    ∂L/∂z = {dldz.toFixed(3)}
                  </div>
                )}
              </div>

              {/* 箭头指向 a */}
              <div className="flex flex-col items-center px-2">
                <div className="text-[10px] text-slate-500 font-mono">a = σ(z)</div>
                <ArrowRight className="w-5 h-5 text-slate-500 my-1" />
                {showBackward && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>× da/dz</span>
                  </div>
                )}
              </div>

              {/* 激活函数节点 a */}
              <div
                onMouseEnter={() => setHighlightNode('a')}
                onMouseLeave={() => setHighlightNode(null)}
                className={`w-28 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  highlightNode === 'a'
                    ? 'bg-purple-950 border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/90 border-purple-500/40 hover:border-purple-400'
                }`}
              >
                <div className="text-[10px] text-purple-400 font-semibold uppercase">激活输出 (a)</div>
                <div className="text-base font-bold text-white font-mono">a = {a.toFixed(3)}</div>
                {showBackward && (
                  <div className="mt-1 text-[11px] text-rose-400 font-mono border-t border-slate-800 pt-1">
                    ∂L/∂a = {dlda.toFixed(3)}
                  </div>
                )}
              </div>

              {/* 箭头指向 Loss */}
              <div className="flex flex-col items-center px-2">
                <div className="text-[10px] text-slate-500 font-mono">0.5(a-y)²</div>
                <ArrowRight className="w-5 h-5 text-slate-500 my-1" />
                {showBackward && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>∂L/∂a</span>
                  </div>
                )}
              </div>

              {/* 损失节点 Loss */}
              <div
                onMouseEnter={() => setHighlightNode('loss')}
                onMouseLeave={() => setHighlightNode(null)}
                className={`w-28 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  highlightNode === 'loss'
                    ? 'bg-rose-950 border-rose-400 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-900/90 border-rose-500/40 hover:border-rose-400'
                }`}
              >
                <div className="text-[10px] text-rose-400 font-semibold uppercase">损失 (Loss)</div>
                <div className="text-base font-bold text-white font-mono">L = {loss.toFixed(4)}</div>
                <div className="mt-1 text-[11px] text-emerald-400 font-mono border-t border-slate-800 pt-1">
                  目标 y = {targetY.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 链式法则数学拆解公式 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          链式相乘拆解过程 (The Chain Rule Multiplication)
        </h4>

        <div className="bg-slate-950/80 p-4 rounded-xl font-mono text-sm border border-slate-800 space-y-2.5 overflow-x-auto">
          <div className="text-slate-400 text-xs">// 目标：求损失 L 对权重 w 的导数 ∂L/∂w</div>
          <div className="text-purple-300">
            \frac{'\u2202L'}{'\u2202w'} = <span className="text-rose-400">\frac{'\u2202L'}{'\u2202a'}</span> ×{' '}
            <span className="text-amber-400">\frac{'\u2202a'}{'\u2202z'}</span> ×{' '}
            <span className="text-cyan-400">\frac{'\u2202z'}{'\u2202w'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">代入实时数值:</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
              ∂L/∂a = (a - y) = {dlda.toFixed(3)}
            </span>
            <span className="text-slate-500">×</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              ∂a/∂z = σ'(z) = {dadz.toFixed(3)}
            </span>
            <span className="text-slate-500">×</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              ∂z/∂w = x = {dzdw.toFixed(3)}
            </span>
            <span className="text-slate-500">=</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              ∂L/∂w = {dldw.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>大模型直觉</strong>：Transformer 内部包含数十亿参数与多层注意力堆叠，正是通过自动微分引擎（如 PyTorch Autograd）
            沿着这种计算图，自动维护每个张量的链式求导乘积，将反向传播计算复杂度从指数级直接缩减为与前向传播同量级的 $O(N)$！
          </span>
        </div>
      </div>
    </div>
  );
};
