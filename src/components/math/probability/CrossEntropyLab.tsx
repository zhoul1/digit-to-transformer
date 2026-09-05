import React, { useState } from 'react';
import { Target, Zap, TrendingDown, Info, Sparkles, Sliders } from 'lucide-react';

interface CandidateToken {
  id: string;
  token: string;
  defaultLogit: number;
}

const DEFAULT_TOKENS: CandidateToken[] = [
  { id: 't1', token: '智能 (Intelligence)', defaultLogit: 3.2 },
  { id: 't2', token: '网络 (Network)', defaultLogit: 1.8 },
  { id: 't3', token: '披萨 (Pizza)', defaultLogit: -1.5 },
  { id: 't4', token: '香蕉 (Banana)', defaultLogit: -2.8 },
];

export const CrossEntropyLab: React.FC = () => {
  const [tokens, setTokens] = useState<CandidateToken[]>(DEFAULT_TOKENS);
  const [targetId, setTargetId] = useState<string>('t1'); // 真实下一个 Token 是 "智能"
  const [singleProb, setSingleProb] = useState<number>(0.7); // 单独滑动条探索 -log(p) 曲线

  // 计算 Softmax 分布
  const maxLogit = Math.max(...tokens.map((t) => t.defaultLogit));
  const expValues = tokens.map((t) => Math.exp(t.defaultLogit - maxLogit));
  const sumExp = expValues.reduce((a, b) => a + b, 0);
  const probs = expValues.map((e) => e / sumExp);

  // 目标 Token 对应的预测概率与交叉熵损失
  const targetIndex = tokens.findIndex((t) => t.id === targetId);
  const targetProb = probs[targetIndex] || 0.0001;
  const currentLoss = -Math.log(targetProb);

  // 计算整个概率分布的香农信息熵: H(P) = -sum(p * log2(p))
  const shannonEntropy = -probs.reduce((acc, p) => (p > 1e-7 ? acc + p * Math.log2(p) : acc), 0);

  // 修改某个 Token 的 Logit
  const handleLogitChange = (id: string, val: number) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, defaultLogit: val } : t)));
  };

  // 绘制 -ln(p) 曲线的 SVG 映射
  const svgWidth = 480;
  const svgHeight = 220;
  const pad = 36;
  const toSvgX = (p: number) => pad + p * (svgWidth - pad * 2);
  const toSvgY = (lossVal: number) => {
    const clamped = Math.min(6, Math.max(0, lossVal));
    return svgHeight - pad - (clamped / 6) * (svgHeight - pad * 2);
  };

  // 曲线路径
  const curvePoints: [number, number][] = [];
  for (let i = 1; i <= 100; i++) {
    const p = i / 100;
    const l = -Math.log(p);
    curvePoints.push([toSvgX(p), toSvgY(l)]);
  }
  const curvePath = curvePoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`, '');

  const singleLoss = -Math.log(singleProb);

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题 */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            概率实验 2
          </span>
          <h3 className="text-xl font-bold text-white tracking-wide">
            交叉熵损失与大模型 Next-Token 惩罚机制 (Cross-Entropy Lab)
          </h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          ChatGPT 等大语言模型训练的目标函数几乎全部采用<strong>交叉熵损失（Cross-Entropy Loss）</strong>。
          它对“自信地预测错误”予以指数级惩罚，倒逼模型把正确的下一个词概率推向 100%。
        </p>
      </div>

      {/* 第一部分：-ln(p) 损失函数曲线与极度惩罚直觉 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-200">单样本对数损失曲线: L = -ln(P_target)</span>
            <span className="text-rose-400 font-mono">当 P → 0 时 Loss → +∞</span>
          </div>

          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            <defs>
              <linearGradient id="ceLossGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="60%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* 网格线与轴 */}
            <line x1={pad} y1={toSvgY(0)} x2={svgWidth - pad} y2={toSvgY(0)} stroke="#334155" strokeWidth="1" />
            <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" />
            <text x={svgWidth - pad - 10} y={toSvgY(0) + 16} fill="#64748b" fontSize="10">P=1.0</text>
            <text x={pad + 2} y={toSvgY(0) + 16} fill="#64748b" fontSize="10">P=0.0</text>
            <text x={pad - 24} y={pad + 10} fill="#64748b" fontSize="10">Loss</text>

            {/* 曲线 */}
            <path d={curvePath} fill="none" stroke="url(#ceLossGrad)" strokeWidth="3" strokeLinecap="round" />

            {/* 动态标记点 */}
            <g>
              <line
                x1={toSvgX(singleProb)}
                y1={toSvgY(singleLoss)}
                x2={toSvgX(singleProb)}
                y2={toSvgY(0)}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle
                cx={toSvgX(singleProb)}
                cy={toSvgY(singleLoss)}
                r="6"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          </svg>

          {/* 单独概率滑块 */}
          <div className="w-full mt-3 px-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">拖动调整正确词预测概率 $P$</span>
              <div className="flex gap-3 font-mono text-xs">
                <span className="text-cyan-400">P = {(singleProb * 100).toFixed(1)}%</span>
                <span className="text-rose-400 font-bold">Loss = {singleLoss.toFixed(4)}</span>
              </div>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={singleProb}
              onChange={(e) => setSingleProb(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* 右侧：香农信息论与直觉解读 */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">为什么不用均方误差 (MSE)？</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              若使用 MSE (ŷ - y)²，当模型极其自信却完全猜错时（如预测概率 0.001），MSE 仅为约 0.998，梯度非常平缓，很难震醒模型！
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              而交叉熵 -ln(0.001) ≈ 6.91，如果概率为 10⁻⁶，Loss 甚至高达 13.8！其梯度为 1/P，
              <strong>当犯下荒谬错误时，反向传播会产生滔天巨浪般的梯度，强力把参数拉回正轨！</strong>
            </p>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-cyan-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              当前词表香农熵 H(P) = {shannonEntropy.toFixed(3)} bits
            </div>
            <p className="text-[11px] text-slate-400">
              信息熵度量了模型当前预测的不确定性：熵越高说明模型越纠结犹豫；熵趋于 0 说明模型无比笃定！
            </p>
          </div>
        </div>
      </div>

      {/* 第二部分：LLM 模拟器：4 个候选 Token 的 Logits 调节与即时交叉熵计算 */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-semibold text-slate-200 text-sm">
              实战模拟：大模型生成文本 “人工智能改变人类【？】”
            </h4>
            <p className="text-xs text-slate-400">设定真实答案（Ground Truth），调节 Logits 观察交叉熵损失的变化</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">真实目标词 (Target):</span>
            <div className="flex gap-1">
              {tokens.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetId(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    targetId === t.id
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.token.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 候选 Token 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {tokens.map((t, idx) => {
            const isTarget = t.id === targetId;
            const prob = probs[idx];
            return (
              <div
                key={t.id}
                className={`p-3 rounded-xl border transition-all ${
                  isTarget
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isTarget && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        目标词 (Target)
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">{t.token}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">Logit: {t.defaultLogit.toFixed(1)}</span>
                    <span className={`font-bold ${isTarget ? 'text-rose-400' : 'text-slate-300'}`}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 概率条 */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    style={{ width: `${prob * 100}%` }}
                    className={`h-full rounded-full transition-all duration-200 ${
                      isTarget ? 'bg-gradient-to-r from-rose-500 to-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                </div>

                {/* Logit 滑块 */}
                <div className="flex items-center gap-2">
                  <Sliders className="w-3 h-3 text-slate-500 shrink-0" />
                  <input
                    type="range"
                    min="-4"
                    max="6"
                    step="0.2"
                    value={t.defaultLogit}
                    onChange={(e) => handleLogitChange(t.id, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded appearance-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 综合损失总结 */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Target className="w-4 h-4 text-rose-400" />
            <span className="text-slate-300">
              当前目标词预测概率: <strong className="text-white font-mono">{(targetProb * 100).toFixed(2)}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Loss = -ln(P_target) =</span>
            <span className="text-xl font-mono font-extrabold text-rose-400 bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-500/30">
              {currentLoss.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
