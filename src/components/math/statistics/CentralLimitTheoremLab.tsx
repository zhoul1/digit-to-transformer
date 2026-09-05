import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

type DistType = 'uniform' | 'bimodal' | 'exponential';

interface PopulationInfo {
  type: DistType;
  name: string;
  description: string;
  sample: () => number;
  mu: number;
  sigma: number;
}

const POPULATIONS: PopulationInfo[] = [
  {
    type: 'uniform',
    name: '平坦均匀分布 (Uniform)',
    description: '母体在 [0, 10] 内每个数值出现概率完全均等，形状是一块平平整整的长方形。',
    sample: () => Math.random() * 10,
    mu: 5.0,
    sigma: Math.sqrt(100 / 12), // ~2.887
  },
  {
    type: 'bimodal',
    name: '极端双峰分布 (Bimodal)',
    description: '母体由两座对称极端的高峰（聚集在 2 和 8）组成，中间几乎没有样本！',
    sample: () => {
      const peak = Math.random() < 0.5 ? 2 : 8;
      return Math.max(0, Math.min(10, peak + (Math.random() + Math.random() - 1) * 1.5));
    },
    mu: 5.0,
    sigma: 3.12,
  },
  {
    type: 'exponential',
    name: '偏斜指数分布 (Exponential)',
    description: '严重向右拖尾的偏态分布，极度不对称，大量聚集在 0 附近。',
    sample: () => {
      // 截断指数分布
      const val = -2.5 * Math.log(1 - Math.random() * 0.96);
      return Math.min(10, val);
    },
    mu: 2.5,
    sigma: 2.4,
  },
];

export const CentralLimitTheoremLab: React.FC = () => {
  const [selectedDist, setSelectedDist] = useState<DistType>('bimodal');
  const [sampleSizeN, setSampleSizeN] = useState<number>(30); // 样本量 N
  const [sampleMeans, setSampleMeans] = useState<number[]>([]); // 收集的样本均值列表
  const [isSampling, setIsSampling] = useState<boolean>(false);

  const curPop = POPULATIONS.find((p) => p.type === selectedDist) || POPULATIONS[0];

  // 理论标准误 Standard Error = sigma / sqrt(N)
  const theoreticalSE = curPop.sigma / Math.sqrt(sampleSizeN);

  // 抽取批量样本均值
  const drawSamples = (count: number) => {
    setIsSampling(true);
    setTimeout(() => {
      const newMeans: number[] = [];
      for (let i = 0; i < count; i++) {
        let sum = 0;
        for (let j = 0; j < sampleSizeN; j++) {
          sum += curPop.sample();
        }
        newMeans.push(sum / sampleSizeN);
      }
      setSampleMeans((prev) => [...prev, ...newMeans]);
      setIsSampling(false);
    }, 40);
  };

  const handleSwitchDist = (type: DistType) => {
    setSelectedDist(type);
    setSampleMeans([]);
  };

  const handleClear = () => {
    setSampleMeans([]);
  };

  // 统计样本均值直方图 (0 ~ 10 区间划分为 40 个桶)
  const numBins = 40;
  const binWidth = 10 / numBins;
  const bins = useMemo(() => {
    const arr = new Array(numBins).fill(0);
    sampleMeans.forEach((m) => {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor(m / binWidth)));
      arr[idx]++;
    });
    return arr;
  }, [sampleMeans, numBins, binWidth]);

  // 经验统计值
  const empiricalMean =
    sampleMeans.length > 0 ? sampleMeans.reduce((a, b) => a + b, 0) / sampleMeans.length : 0;
  const empiricalSE =
    sampleMeans.length > 1
      ? Math.sqrt(
          sampleMeans.reduce((acc, v) => acc + Math.pow(v - empiricalMean, 2), 0) /
            (sampleMeans.length - 1)
        )
      : 0;

  // SVG 图表映射 (560 x 240)
  const svgWidth = 560;
  const svgHeight = 240;
  const pad = 36;

  const maxBinCount = Math.max(...bins, 1);
  const maxFreq = sampleMeans.length > 0 ? maxBinCount / (sampleMeans.length * binWidth) : 0.6;
  const maxY = Math.max(maxFreq, 0.5) * 1.2;

  const toSvgX = (x: number) => pad + (x / 10) * (svgWidth - pad * 2);
  const toSvgY = (dens: number) => svgHeight - pad - (dens / maxY) * (svgHeight - pad * 2);

  // 理论正态曲线点集 (中心极限定理预测)
  const gaussianPath = useMemo(() => {
    const pts: [number, number][] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 10;
      const density =
        (1 / (theoreticalSE * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x - curPop.mu) / theoreticalSE, 2));
      pts.push([toSvgX(x), toSvgY(density)]);
    }
    return pts.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`, '');
  }, [curPop.mu, theoreticalSE, maxY]);

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题与母体切换 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              统计实验 1
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              中心极限定理沙盒 (Central Limit Theorem Lab)
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">{curPop.description}</p>
        </div>

        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {POPULATIONS.map((p) => (
            <button
              key={p.type}
              onClick={() => handleSwitchDist(p.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDist === p.type
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 控制器 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">每组样本容量 N (Sample Size)</span>
            <span className="font-mono text-cyan-400 font-bold">N = {sampleSizeN}</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={sampleSizeN}
            onChange={(e) => {
              setSampleSizeN(parseInt(e.target.value));
              setSampleMeans([]);
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>N=1 (复刻母体畸形)</span>
            <span>N=5 (初现钟形)</span>
            <span>N≥30 (完美正态)</span>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <span className="text-xs text-slate-300 font-medium block mb-1.5">抽样实验触发器</span>
          <div className="flex gap-2">
            <button
              disabled={isSampling}
              onClick={() => drawSamples(200)}
              className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              抽取 200 组均值
            </button>
            <button
              disabled={isSampling}
              onClick={() => drawSamples(1000)}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              抽取 1000 组
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
              title="清空样本"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 状态诊断 */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-center text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            {sampleSizeN >= 30 ? '已满足经典大样本准则 (N ≥ 30)' : sampleSizeN === 1 ? 'N=1: 均值完全退化为母体' : '过渡阶段：正态雏形正在形成'}
          </div>
          <span className="text-[11px] text-slate-400">
            标准误缩减比率: σ_X̄ = σ / √N = {theoreticalSE.toFixed(3)}
          </span>
        </div>
      </div>

      {/* 核心直方图对比展示 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
        <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-cyan-500/80 inline-block" />
              样本均值 x̄ 经验分布 ({sampleMeans.length} 组)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
              中心极限预测正态曲线 N(μ, σ²/N)
            </span>
          </div>
          <div className="font-mono text-xs text-slate-500">
            实际均值: {sampleMeans.length > 0 ? empiricalMean.toFixed(2) : '-'} | 实际标准误: {sampleMeans.length > 1 ? empiricalSE.toFixed(2) : '-'}
          </div>
        </div>

        <div className="w-full flex justify-center overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            {/* 网格与坐标轴 */}
            <line x1={pad} y1={toSvgY(0)} x2={svgWidth - pad} y2={toSvgY(0)} stroke="#334155" strokeWidth="1" />
            <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" />
            <text x={pad} y={toSvgY(0) + 14} fill="#64748b" fontSize="10">0</text>
            <text x={toSvgX(5) - 4} y={toSvgY(0) + 14} fill="#64748b" fontSize="10">5</text>
            <text x={svgWidth - pad - 10} y={toSvgY(0) + 14} fill="#64748b" fontSize="10">10</text>

            {/* 样本均值直方图 */}
            {bins.map((count, idx) => {
              const freqDensity = sampleMeans.length > 0 ? count / (sampleMeans.length * binWidth) : 0;
              const barX = toSvgX(idx * binWidth);
              const barW = Math.max(1.5, ((svgWidth - pad * 2) / numBins) - 1.5);
              const barH = (freqDensity / maxY) * (svgHeight - pad * 2);
              const barY = svgHeight - pad - barH;

              return (
                <rect
                  key={idx}
                  x={barX}
                  y={barY}
                  width={barW}
                  height={Math.max(0, barH)}
                  fill="#06b6d4"
                  opacity={count > 0 ? 0.75 : 0.1}
                  rx="1"
                >
                  <title>区间 [{(idx * binWidth).toFixed(1)}, {((idx + 1) * binWidth).toFixed(1)}]: {count} 组</title>
                </rect>
              );
            })}

            {/* 理论高斯正态拟合曲线 */}
            <path d={gaussianPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

            {/* 均值中心线 */}
            <line
              x1={toSvgX(curPop.mu)}
              y1={pad}
              x2={toSvgX(curPop.mu)}
              y2={svgHeight - pad}
              stroke="#fbbf24"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* 深度学习直觉联系 */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
        <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          AI 工程师的必修心法：为什么 Batch Size 无需特别大？
        </span>
        <p className="text-slate-400 leading-relaxed">
          在训练大语言模型时，全量数据集高达几十 TB，不可能一次性送入显卡。中心极限定理保证：只要单批次样本量（Mini-batch Size，例如 64 或 128）足够，
          <strong>Batch 的样本梯度均值就能极其精准地逼近真实全量数据集的期望梯度</strong>，并且方差以 1/√N 的速度急剧缩减！
          这就是随机小批量梯度下降（Mini-batch SGD / Adam）之所以成立的数理基石。
        </p>
      </div>
    </div>
  );
};
