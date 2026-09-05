import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Sparkles, BarChart2, Coins } from 'lucide-react';

export const BinomialToGaussianLab: React.FC = () => {
  const [numCoins, setNumCoins] = useState<number>(20); // 抛硬币次数 n
  const [probHeads, setProbHeads] = useState<number>(0.5); // 正面概率 p
  const [trials, setTrials] = useState<number[]>([]); // 模拟实验记录正面朝上的次数列表
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 理论二项分布计算组合数 C(n, k)
  const binomialProb = (n: number, k: number, p: number) => {
    if (k < 0 || k > n) return 0;
    let logComb = 0;
    for (let i = 1; i <= k; i++) {
      logComb += Math.log(n - i + 1) - Math.log(i);
    }
    const logP = logComb + k * Math.log(p) + (n - k) * Math.log(1 - p);
    return Math.exp(logP);
  };

  // 理论高斯正态密度
  const theoreticalMu = numCoins * probHeads;
  const theoreticalSigma = Math.sqrt(numCoins * probHeads * (1 - probHeads));
  const normalDensity = (x: number, mu: number, sigma: number) => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  // 触发模拟投掷实验
  const runSimulation = (batchSize: number) => {
    setIsSimulating(true);
    setTimeout(() => {
      const newTrials: number[] = [];
      for (let i = 0; i < batchSize; i++) {
        let heads = 0;
        for (let c = 0; c < numCoins; c++) {
          if (Math.random() < probHeads) heads++;
        }
        newTrials.push(heads);
      }
      setTrials((prev) => [...prev, ...newTrials]);
      setIsSimulating(false);
    }, 50);
  };

  const resetTrials = () => {
    setTrials([]);
  };

  // 频次统计
  const counts = useMemo(() => {
    const arr = new Array(numCoins + 1).fill(0);
    trials.forEach((t) => {
      if (t >= 0 && t <= numCoins) arr[t]++;
    });
    return arr;
  }, [trials, numCoins]);

  // 样本均值与方差
  const empiricalMean = trials.length > 0 ? trials.reduce((a, b) => a + b, 0) / trials.length : 0;
  const empiricalVariance =
    trials.length > 1
      ? trials.reduce((acc, v) => acc + Math.pow(v - empiricalMean, 2), 0) / (trials.length - 1)
      : 0;

  // SVG 坐标映射
  const svgWidth = 560;
  const svgHeight = 260;
  const pad = 36;

  // 寻找纵轴最高点
  const maxBinom = binomialProb(numCoins, Math.round(theoreticalMu), probHeads);
  const maxEmpiricalFreq = trials.length > 0 ? Math.max(...counts) / trials.length : 0;
  const maxY = Math.max(maxBinom, maxEmpiricalFreq, 0.15) * 1.15;

  const toSvgX = (k: number) => pad + (k / numCoins) * (svgWidth - pad * 2);
  const toSvgY = (yVal: number) => svgHeight - pad - (yVal / maxY) * (svgHeight - pad * 2);

  // 绘制理论连续高斯钟形曲线
  const gaussianPoints: [number, number][] = [];
  const gSteps = 100;
  for (let i = 0; i <= gSteps; i++) {
    const x = (i / gSteps) * numCoins;
    const y = normalDensity(x, theoreticalMu, theoreticalSigma);
    gaussianPoints.push([toSvgX(x), toSvgY(y)]);
  }
  const gaussianPath = gaussianPoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`,
    ''
  );

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题 */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            概率实验 3
          </span>
          <h3 className="text-xl font-bold text-white tracking-wide">
            大数定律与高斯钟形曲线涌现 (Binomial to Gaussian)
          </h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          单个事件的随机性不可预测，但大量微小随机事件的叠加，必定涌现出极其优美且稳定的<strong>高斯正态分布（Normal Distribution）</strong>。
        </p>
      </div>

      {/* 控制滑块区 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">每轮抛掷硬币枚数 $n$</span>
            <span className="font-mono text-emerald-400 font-bold">{numCoins} 枚</span>
          </div>
          <input
            type="range"
            min="6"
            max="60"
            step="2"
            value={numCoins}
            onChange={(e) => {
              setNumCoins(parseInt(e.target.value));
              setTrials([]);
            }}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>6 (阶梯离散)</span>
            <span>60 (平滑逼近正态)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">正面概率 $p$</span>
            <span className="font-mono text-indigo-400 font-bold">{probHeads.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.05"
            value={probHeads}
            onChange={(e) => {
              setProbHeads(parseFloat(e.target.value));
              setTrials([]);
            }}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0.2 (左偏)</span>
            <span>0.5 (完全对称)</span>
            <span>0.8 (右偏)</span>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <span className="text-xs text-slate-300 font-medium block mb-1.5">投掷实验模拟池</span>
          <div className="flex gap-2">
            <button
              disabled={isSimulating}
              onClick={() => runSimulation(200)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <Coins className="w-3.5 h-3.5" />
              +200 次
            </button>
            <button
              disabled={isSimulating}
              onClick={() => runSimulation(1000)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              +1000 次
            </button>
            <button
              onClick={resetTrials}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
              title="清空记录"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG 直方图 + 高斯拟合曲线 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
        <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
              实际样本频率 ({trials.length} 次)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
              理论高斯密度 Gaussian(μ, σ²)
            </span>
          </div>
          <div className="font-mono text-xs text-slate-500">
            理论期望 μ = {theoreticalMu.toFixed(2)} | 标准差 σ = {theoreticalSigma.toFixed(2)}
          </div>
        </div>

        <div className="w-full flex justify-center overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            {/* 网格与轴 */}
            <line x1={pad} y1={toSvgY(0)} x2={svgWidth - pad} y2={toSvgY(0)} stroke="#334155" strokeWidth="1" />
            <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" />

            {/* 柱状直方图 */}
            {counts.map((c, k) => {
              const freq = trials.length > 0 ? c / trials.length : 0;
              const barWidth = Math.max(2, (svgWidth - pad * 2) / (numCoins + 1) - 2);
              const barX = toSvgX(k) - barWidth / 2;
              const barH = ((freq / maxY) * (svgHeight - pad * 2));
              const barY = svgHeight - pad - barH;

              return (
                <rect
                  key={k}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(0, barH)}
                  fill="#6366f1"
                  opacity={freq > 0 ? 0.75 : 0.15}
                  rx="1.5"
                >
                  <title>正面出现 {k} 次: {c} 轮 ({(freq * 100).toFixed(2)}%)</title>
                </rect>
              );
            })}

            {/* 高斯理论钟形曲线 */}
            <path d={gaussianPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

            {/* 期望中轴虚线 */}
            <line
              x1={toSvgX(theoreticalMu)}
              y1={pad}
              x2={toSvgX(theoreticalMu)}
              y2={svgHeight - pad}
              stroke="#fbbf24"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <text x={toSvgX(theoreticalMu) + 4} y={pad + 12} fill="#fbbf24" fontSize="10">
              μ={theoreticalMu.toFixed(1)}
            </text>
          </svg>
        </div>
      </div>

      {/* 数值对照表与大模型洞察 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs uppercase font-semibold text-slate-400">大数定律经验值 vs 理论真值</span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">实际样本均值 x̄</span>
              <span className="text-base font-mono font-bold text-white">
                {trials.length > 0 ? empiricalMean.toFixed(3) : '-'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">理论: {theoreticalMu.toFixed(3)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">实际样本方差 s²</span>
              <span className="text-base font-mono font-bold text-white">
                {trials.length > 1 ? empiricalVariance.toFixed(3) : '-'}
              </span>
              <span className="text-[10px] text-indigo-400 block mt-0.5">
                理论: {(Math.pow(theoreticalSigma, 2)).toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex flex-col justify-center space-y-1.5 text-xs text-emerald-200">
          <span className="font-bold flex items-center gap-1.5 text-emerald-300">
            <Sparkles className="w-4 h-4" />
            为什么大模型权重初始化如此看重高斯正态分布？
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            在 Transformer 中，一个 Token 向量经过全连接层时会和上千个权重求点积：y = ∑ w_i x_i。
            根据棣莫弗-拉普拉斯中心极限思想，即使输入和初始权重有微小扰动，其加权和必然趋于正态分布！现代初始化方案（如 He
            初始化和正态截断）正是利用了这一精确方差公式，防止前向传播信号随层数暴涨或衰减。
          </p>
        </div>
      </div>
    </div>
  );
};
