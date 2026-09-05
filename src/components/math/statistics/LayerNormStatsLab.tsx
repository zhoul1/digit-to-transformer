import React, { useState } from 'react';
import { Sliders, RefreshCw, Zap, Sparkles, Layers, ShieldCheck } from 'lucide-react';

const PRESETS = [
  {
    id: 'drift',
    name: '严重均值漂移 (Mean Drift)',
    vals: [7.2, 8.5, 9.1, 6.8, 8.0, 9.4, 7.8, 8.8],
    desc: '特征均值漂移到 8.2 左右，可能导致深层激活饱和。',
  },
  {
    id: 'variance_spike',
    name: '方差暴增与极端尖峰 (Variance Spike)',
    vals: [-12.0, 15.2, -8.4, 18.0, 0.5, -14.2, 9.0, 11.5],
    desc: '极端大数值产生数十倍方差，极易引发梯度爆炸！',
  },
  {
    id: 'healthy',
    name: '温和分布 (Normal Range)',
    vals: [1.2, -0.8, 0.5, 1.8, -1.4, 0.2, 0.9, -0.6],
    desc: '正常未受扰动的隐层神经元激活状态。',
  },
];

export const LayerNormStatsLab: React.FC = () => {
  const [vector, setVector] = useState<number[]>([7.2, 8.5, 9.1, 6.8, 8.0, 9.4, 7.8, 8.8]);
  const [gamma, setGamma] = useState<number>(1.0); // 可学习缩放参数
  const [beta, setBeta] = useState<number>(0.0); // 可学习平移参数
  const eps = 1e-5;

  // 1. 计算均值 mu
  const dim = vector.length;
  const mean = vector.reduce((a, b) => a + b, 0) / dim;

  // 2. 计算方差 sigma^2
  const variance = vector.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / dim;
  const std = Math.sqrt(variance + eps);

  // 3. 归一化与仿射变换
  const normalized = vector.map((v) => (v - mean) / std);
  const finalOutput = normalized.map((xHat) => gamma * xHat + beta);

  // 归一化后的检验均值与方差
  const normMean = normalized.reduce((a, b) => a + b, 0) / dim;
  const normVar = normalized.reduce((acc, v) => acc + Math.pow(v - normMean, 2), 0) / dim;

  // 随机注入扰动
  const injectNoise = () => {
    setVector((prev) => prev.map((v) => parseFloat((v + (Math.random() * 6 - 3)).toFixed(1))));
  };

  const handleApplyPreset = (presetVals: number[]) => {
    setVector([...presetVals]);
  };

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题与预设选择 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              统计实验 2
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              大模型生命线：LayerNorm 层归一化统计实验室
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Transformer 之所以能堆叠到 100 多层而不会数值发散，全靠每一个注意力子层后的 LayerNorm（均值归零与方差标定）。
          </p>
        </div>

        {/* 预设切换 */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.vals)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={injectNoise}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/20 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            注入随机扰动
          </button>
        </div>
      </div>

      {/* 核心对比：归一化前后柱状对照 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入原始 Token 隐层向量 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              归一化前：原始特征向量 $x$ (8 维通道)
            </span>
            <span className="font-mono text-xs text-slate-400">
              μ = {mean.toFixed(2)} | σ² = {variance.toFixed(2)}
            </span>
          </div>

          {/* 柱状可视化 */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-slate-900/50 rounded-xl border border-slate-800/80 relative">
            {/* 均值虚线 */}
            <div
              style={{ bottom: `${Math.max(10, Math.min(90, 50 + (mean / 20) * 40))}%` }}
              className="absolute left-0 right-0 border-b border-rose-500/60 border-dashed z-10 pointer-events-none flex justify-end pr-2"
            >
              <span className="text-[10px] text-rose-400 font-mono -mt-4 bg-slate-950 px-1 rounded">
                均值 μ = {mean.toFixed(2)}
              </span>
            </div>

            {vector.map((val, idx) => {
              const heightPercent = Math.min(100, Math.max(8, (Math.abs(val) / 20) * 90));
              const isPositive = val >= 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-0">
                  <span className="text-[10px] font-mono text-slate-400">{val.toFixed(1)}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      isPositive ? 'bg-rose-500/80' : 'bg-rose-700/60'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">c{idx}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">
            可以看到特征均值严重偏离 0，且通道之间波动剧烈，若直接输入下一层会导致数值层级失控。
          </p>
        </div>

        {/* 右侧：经过 LayerNorm 标准化后的特征向量 */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              归一化后：标准正态化输出 y = γ · x̂ + β
            </span>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              μ ≈ {normMean.toFixed(1)} | σ² ≈ {normVar.toFixed(1)}
            </span>
          </div>

          {/* 柱状可视化 */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-slate-900/50 rounded-xl border border-slate-800/80 relative">
            {/* 0 基准线 */}
            <div className="absolute left-0 right-0 bottom-1/2 border-b border-emerald-500/50 z-10 pointer-events-none flex justify-end pr-2">
              <span className="text-[10px] text-emerald-400 font-mono -mt-4 bg-slate-950 px-1 rounded">
                零中心 (μ = 0)
              </span>
            </div>

            {finalOutput.map((val, idx) => {
              const heightPercent = Math.min(95, Math.max(10, (Math.abs(val) / 3.0) * 45));
              const isPositive = val >= 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-0">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">{val.toFixed(2)}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      isPositive ? 'bg-emerald-500/80' : 'bg-emerald-700/60'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">c{idx}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-emerald-400/90 font-medium">
            ✅ 完美！无论输入如何剧烈波动，LayerNorm 将所有通道强制拉回以 0 为中心、方差恒为 1 的黄金稳定带！
          </p>
        </div>
      </div>

      {/* 仿射调节与统计学公式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-3">
          <span className="text-xs uppercase font-semibold text-slate-400 block">
            可学习仿射参数 (Learnable Affine Parameters)
          </span>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">缩放因子 γ (Gain)</span>
              <span className="font-mono text-indigo-400 font-bold">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">平移偏置 β (Bias)</span>
              <span className="font-mono text-cyan-400 font-bold">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="1.5"
              step="0.1"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-xs flex flex-col justify-center space-y-1.5">
          <div className="text-purple-300 font-bold">
            {"x̂_i = (x_i - μ) / √(σ² + ε)"}
          </div>
          <div className="text-slate-400 text-[11px] leading-relaxed">
            {"μ = (1/d) Σ x_i,   σ² = (1/d) Σ (x_i - μ)²"}
          </div>
          <div className="text-emerald-400 text-[11px] pt-1 border-t border-slate-800">
            {"输出: y_i = γ · x̂_i + β"}
          </div>
        </div>
      </div>
    </div>
  );
};
