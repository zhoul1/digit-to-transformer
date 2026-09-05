import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Zap, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';

interface Landscape {
  id: string;
  name: string;
  formula: string;
  f: (w: number) => number;
  df: (w: number) => number;
  rangeW: [number, number];
  rangeLoss: [number, number];
  defaultW: number;
  description: string;
}

const LANDSCAPES: Landscape[] = [
  {
    id: 'convex',
    name: '凸碗形损失函数 (完美单极小)',
    formula: 'L(w) = w^2',
    f: (w) => w * w,
    df: (w) => 2 * w,
    rangeW: [-3, 3],
    rangeLoss: [-0.5, 9.5],
    defaultW: 2.6,
    description: '最经典的凸优化场景，全域只有唯一的全局极小点 w* = 0。',
  },
  {
    id: 'double-well',
    name: '双谷多极小地形 (局部最优陷阱)',
    formula: 'L(w) = 0.25w^4 - 1.5w^2 + 0.4w + 2.5',
    f: (w) => 0.25 * Math.pow(w, 4) - 1.5 * Math.pow(w, 2) + 0.4 * w + 2.5,
    df: (w) => Math.pow(w, 3) - 3 * w + 0.4,
    rangeW: [-2.8, 2.8],
    rangeLoss: [-0.5, 7],
    defaultW: -2.3,
    description: '深度学习中高维损失地形的典型缩影：存在多个极小值与鞍点，极易被困在次优坑中。',
  },
  {
    id: 'bumpy',
    name: '高频震荡沟壑 (步长敏感挑战)',
    formula: 'L(w) = 0.3w^2 + 0.8\\sin(3w) + 1.2',
    f: (w) => 0.3 * w * w + 0.8 * Math.sin(3 * w) + 1.2,
    df: (w) => 0.6 * w + 2.4 * Math.cos(3 * w),
    rangeW: [-3.2, 3.2],
    rangeLoss: [-0.2, 5.5],
    defaultW: 2.7,
    description: '布满细小波纹褶皱的地形，若学习率过大容易来回震荡剧烈跳出。',
  },
];

export const GradientDescentLab: React.FC = () => {
  const [selectedLandId, setSelectedLandId] = useState<string>('convex');
  const landscape = LANDSCAPES.find((l) => l.id === selectedLandId) || LANDSCAPES[0];

  const [lr, setLr] = useState<number>(0.2); // 学习率 eta
  const [useMomentum, setUseMomentum] = useState<boolean>(false);
  const [momentumBeta, setMomentumBeta] = useState<number>(0.8);

  const [currentW, setCurrentW] = useState<number>(landscape.defaultW);
  const [velocity, setVelocity] = useState<number>(0);
  const [history, setHistory] = useState<{ step: number; w: number; loss: number; grad: number }[]>([
    { step: 0, w: landscape.defaultW, loss: landscape.f(landscape.defaultW), grad: landscape.df(landscape.defaultW) },
  ]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // 切换地形时重置
  const handleSelectLandscape = (id: string) => {
    const target = LANDSCAPES.find((l) => l.id === id) || LANDSCAPES[0];
    setSelectedLandId(id);
    setIsPlaying(false);
    setCurrentW(target.defaultW);
    setVelocity(0);
    setHistory([{ step: 0, w: target.defaultW, loss: target.f(target.defaultW), grad: target.df(target.defaultW) }]);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentW(landscape.defaultW);
    setVelocity(0);
    setHistory([
      { step: 0, w: landscape.defaultW, loss: landscape.f(landscape.defaultW), grad: landscape.df(landscape.defaultW) },
    ]);
  };

  // 单步优化核心
  const stepOptimization = () => {
    const grad = landscape.df(currentW);
    let nextW = currentW;
    let nextV = 0;

    if (useMomentum) {
      nextV = momentumBeta * velocity + lr * grad;
      nextW = currentW - nextV;
      setVelocity(nextV);
    } else {
      nextW = currentW - lr * grad;
    }

    // 防数值爆炸限制在合理范围
    if (Math.abs(nextW) > 10) {
      setIsPlaying(false);
    }

    const nextLoss = landscape.f(nextW);
    const nextGrad = landscape.df(nextW);

    setCurrentW(nextW);
    setHistory((prev) => {
      const nextStep = prev.length;
      return [...prev.slice(-30), { step: nextStep, w: nextW, loss: nextLoss, grad: nextGrad }];
    });
  };

  // 自动循环播放
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentW((prevW) => {
          const grad = landscape.df(prevW);
          let newW = prevW;
          if (useMomentum) {
            const newV = momentumBeta * velocity + lr * grad;
            setVelocity(newV);
            newW = prevW - newV;
          } else {
            newW = prevW - lr * grad;
          }

          if (Math.abs(newW) > 10 || Math.abs(grad) < 0.0005) {
            setIsPlaying(false);
          }

          const newLoss = landscape.f(newW);
          const newGrad = landscape.df(newW);

          setHistory((h) => {
            const nextStep = h.length;
            return [...h.slice(-30), { step: nextStep, w: newW, loss: newLoss, grad: newGrad }];
          });

          return newW;
        });
      }, 160);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, lr, useMomentum, momentumBeta, landscape, velocity]);

  // SVG 坐标变换
  const svgWidth = 560;
  const svgHeight = 280;
  const pad = 40;
  const [minW, maxW] = landscape.rangeW;
  const [minL, maxL] = landscape.rangeLoss;

  const toSvgX = (w: number) => pad + ((w - minW) / (maxW - minW)) * (svgWidth - pad * 2);
  const toSvgY = (l: number) => svgHeight - pad - ((l - minL) / (maxL - minL)) * (svgHeight - pad * 2);

  // 采样绘制曲线
  const curvePoints: [number, number][] = [];
  const samples = 140;
  for (let i = 0; i <= samples; i++) {
    const w = minW + (i / samples) * (maxW - minW);
    const l = landscape.f(w);
    curvePoints.push([toSvgX(w), toSvgY(l)]);
  }
  const curvePath = curvePoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`, '');

  const curLoss = landscape.f(currentW);
  const curGrad = landscape.df(currentW);
  const curX = toSvgX(currentW);
  const curY = toSvgY(curLoss);

  // 诊断当前状态
  let statusBadge = {
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    text: '平稳收敛中 (梯度指向极小值)',
  };
  if (Math.abs(curGrad) < 0.02) {
    statusBadge = {
      color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      text: '已达到极值点 (梯度 ≈ 0，收敛完成)',
    };
  } else if (lr > 0.85) {
    statusBadge = {
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      text: '学习率过大！可能发生剧烈振荡或梯度爆炸',
    };
  } else if (lr < 0.05) {
    statusBadge = {
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <Sliders className="w-4 h-4 text-amber-400" />,
      text: '学习率偏小，前进步伐极其缓慢',
    };
  }

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题与场景切换 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              交互实验 2
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">梯度下降动态模拟舱 (Gradient Descent Lab)</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">{landscape.description}</p>
        </div>

        {/* 地形选择 */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {LANDSCAPES.map((l) => (
            <button
              key={l.id}
              onClick={() => handleSelectLandscape(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLandId === l.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {l.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 主展示区：SVG 图形 + 状态指示 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {/* 实时状态胶囊 */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border backdrop-blur-md ${statusBadge.color}`}>
              {statusBadge.icon}
              <span>{statusBadge.text}</span>
            </div>
          </div>

          <div className="w-full flex justify-center overflow-x-auto">
            <svg width={svgWidth} height={svgHeight} className="select-none">
              {/* 背景网格 */}
              <defs>
                <pattern id="gdGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" strokeWidth="0.7" opacity="0.6" />
                </pattern>
                <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
                <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </radialGradient>
              </defs>

              <rect width={svgWidth} height={svgHeight} fill="url(#gdGrid)" rx="8" />

              {/* 轴线 */}
              <line x1={pad} y1={toSvgY(0)} x2={svgWidth - pad} y2={toSvgY(0)} stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={toSvgX(0)} y1={pad} x2={toSvgX(0)} y2={svgHeight - pad} stroke="#475569" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x={svgWidth - pad + 6} y={toSvgY(0) + 4} fill="#64748b" fontSize="10">w</text>
              <text x={toSvgX(0) - 16} y={pad - 6} fill="#64748b" fontSize="10">Loss L(w)</text>

              {/* 损失曲面 */}
              <path d={curvePath} fill="none" stroke="url(#curveGrad)" strokeWidth="3.5" strokeLinecap="round" />

              {/* 历史轨迹点 */}
              {history.map((h, i) => {
                const hx = toSvgX(h.w);
                const hy = toSvgY(h.loss);
                const alpha = Math.max(0.15, (i + 1) / history.length);
                return (
                  <circle
                    key={i}
                    cx={hx}
                    cy={hy}
                    r={3}
                    fill="#f43f5e"
                    opacity={alpha}
                  />
                );
              })}

              {/* 历史连线 */}
              {history.length > 1 && (
                <polyline
                  points={history.map((h) => `${toSvgX(h.w)},${toSvgY(h.loss)}`).join(' ')}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
              )}

              {/* 负梯度方向指示箭头 */}
              {currentW >= minW && currentW <= maxW && (
                <g>
                  {/* 切线小段 */}
                  <line
                    x1={curX - 25}
                    y1={curY + 25 * curGrad * ((svgHeight - pad * 2) / (maxL - minL)) / ((svgWidth - pad * 2) / (maxW - minW))}
                    x2={curX + 25}
                    y2={curY - 25 * curGrad * ((svgHeight - pad * 2) / (maxL - minL)) / ((svgWidth - pad * 2) / (maxW - minW))}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  />
                  {/* 下降推力箭头 */}
                  <line
                    x1={curX}
                    y1={curY}
                    x2={curX - Math.sign(curGrad) * Math.min(45, Math.abs(curGrad) * 20)}
                    y2={curY}
                    stroke="#22c55e"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />
                </g>
              )}

              {/* 当前小球 (参数当前状态) */}
              {currentW >= minW - 0.5 && currentW <= maxW + 0.5 && (
                <g>
                  <circle cx={curX} cy={curY} r="14" fill="#f43f5e" opacity="0.25" className="animate-ping" />
                  <circle cx={curX} cy={curY} r="7.5" fill="url(#ballGlow)" stroke="#ffffff" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-500 mt-2 px-4">
            <span>起点步数: #{history[0]?.step ?? 0}</span>
            <span className="text-indigo-400 font-mono">更新公式: w ← w - η · ∇L(w)</span>
            <span>已优化步数: {history.length - 1} 步</span>
          </div>
        </div>

        {/* 右侧数值仪表盘与控制器 */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">实时参数状态</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block">当前权重 w</span>
                <span className="text-lg font-mono font-bold text-white">{currentW.toFixed(4)}</span>
              </div>
              <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block">当前损失 Loss</span>
                <span className="text-lg font-mono font-bold text-rose-400">{curLoss.toFixed(4)}</span>
              </div>
              <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block">梯度 ∇L(w)</span>
                <span className={`text-lg font-mono font-bold ${curGrad >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {curGrad.toFixed(4)}
                </span>
              </div>
              <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60">
                <span className="text-[11px] text-slate-500 block">步进更新量 Δw</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {(-(useMomentum ? velocity : lr * curGrad)).toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* 超参数调节区 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-300">学习率 η (Learning Rate)</span>
                <span className="font-mono text-indigo-400 font-bold">{lr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="1.1"
                step="0.02"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.02 (极慢收敛)</span>
                <span>0.2 (平稳)</span>
                <span>1.1 (震荡发散)</span>
              </div>
            </div>

            {/* 动量选项 */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="momentumToggle"
                    checked={useMomentum}
                    onChange={(e) => setUseMomentum(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="momentumToggle" className="text-xs font-medium text-slate-300 cursor-pointer">
                    启用动量加速 (Momentum)
                  </label>
                </div>
                {useMomentum && (
                  <span className="text-xs font-mono text-purple-400">β = {momentumBeta}</span>
                )}
              </div>
              {useMomentum && (
                <p className="text-[11px] text-purple-300/80 mt-1.5 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                  物理惯性：模拟带质量的小球冲过平坦鞍点或狭窄震荡区。
                </p>
              )}
            </div>

            {/* 控制按钮群 */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-md ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? '暂停优化' : '连续迭代 (Run)'}
              </button>

              <button
                disabled={isPlaying}
                onClick={stepOptimization}
                className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium transition-all border border-slate-700/60"
                title="单步微调"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                单步
              </button>

              <button
                onClick={resetSimulation}
                className="flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all border border-slate-700/60"
                title="重置位置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底层 AI / 深度学习直觉说明 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-xs font-bold text-indigo-400 block mb-1">1. 为什么是反方向？</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            梯度 ∇L 指向函数增长最快的方向；为了让损失变小，参数必须往反方向更新：-η · ∇L。
          </p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-xs font-bold text-rose-400 block mb-1">2. 学习率灾难</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            试着把学习率拉到 1.0 以上：小球会在谷底两岸左右横跳，最终飞出屏幕（梯度爆炸 NaN）！这就是为什么大模型预训练需要 Warmup 和 Cosine 退火。
          </p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-xs font-bold text-cyan-400 block mb-1">3. 大模型中的 AdamW</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            GPT 等 Transformer 参数规模数百亿，使用的是基于梯度的自适应动量优化器 AdamW，给每个参数单独计算平滑的步长。
          </p>
        </div>
      </div>
    </div>
  );
};
