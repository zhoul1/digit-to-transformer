import React, { useState, useMemo } from 'react';
import { Sliders, RefreshCw, Compass, Sparkles, TrendingUp, Shuffle } from 'lucide-react';

interface ConceptPreset {
  name: string;
  r: number;
  pair: [string, string];
  desc: string;
}

const PRESETS: ConceptPreset[] = [
  {
    name: '强正相关 (近义关联)',
    r: 0.92,
    pair: ['“代码” 向量', '“程序” 向量'],
    desc: '语义高度重合，在高维向量空间中夹角极小，余弦相似度极高。',
  },
  {
    name: '零相关 (正交独立)',
    r: 0.02,
    pair: ['“量子力学” 向量', '“香蕉蛋糕” 向量'],
    desc: '语义互不相干，向量相互垂直（正交 90°），自注意力得分为 0。',
  },
  {
    name: '强负相关 (反义对立)',
    r: -0.88,
    pair: ['“极度严寒” 向量', '“烈日炎炎” 向量'],
    desc: '语义完全相反，向量反向延伸（夹角接近 180°）。',
  },
];

export const CorrelationLab: React.FC = () => {
  const [targetR, setTargetR] = useState<number>(0.85); // 设定的相关系数
  const [seed, setSeed] = useState<number>(1);

  // 伪随机数生成器（固定种子以便平滑演示）
  const pseudoRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // 生成具有指定相关系数 r 的二维点集 (50 个散点)
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const numPoints = 50;
    const r = targetR;

    for (let i = 0; i < numPoints; i++) {
      // 独立标准正态近似 (Box-Muller 简易变换)
      const u1 = Math.max(1e-6, pseudoRandom(seed * 1000 + i * 2));
      const u2 = pseudoRandom(seed * 1000 + i * 2 + 1);
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      const u3 = Math.max(1e-6, pseudoRandom(seed * 2000 + i * 2));
      const u4 = pseudoRandom(seed * 2000 + i * 2 + 1);
      const z2 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

      // Cholesky 分解生成相关随机变量
      const x = z1;
      const y = r * z1 + Math.sqrt(Math.max(0, 1 - r * r)) * z2;
      pts.push({ x, y });
    }
    return pts;
  }, [targetR, seed]);

  // 计算样本实际皮尔逊相关系数 r
  const n = points.length;
  const meanX = points.reduce((acc, p) => acc + p.x, 0) / n;
  const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  points.forEach((p) => {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  });

  const actualR = varX > 0 && varY > 0 ? cov / Math.sqrt(varX * varY) : targetR;
  // 最佳拟合回归斜率
  const slope = varX > 0 ? cov / varX : 0;
  const intercept = meanY - slope * meanX;

  // 向量夹角 theta = arccos(r)
  const angleRad = Math.acos(Math.max(-1, Math.min(1, actualR)));
  const angleDeg = (angleRad * 180) / Math.PI;

  // SVG 坐标映射
  const svgWidth = 460;
  const svgHeight = 240;
  const pad = 36;
  const range = 3.2; // 坐标范围 [-3.2, 3.2]

  const toSvgX = (x: number) => pad + ((x + range) / (2 * range)) * (svgWidth - pad * 2);
  const toSvgY = (y: number) => svgHeight - pad - ((y + range) / (2 * range)) * (svgHeight - pad * 2);

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              统计实验 3
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              皮尔逊相关系数与向量余弦相似度实验室
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            大模型中的词向量（Word Embedding）语义匹配与自注意力机制（Self-Attention $Q \cdot K^T$），本质就是高维统计相关性与余弦相似度！
          </p>
        </div>

        {/* 预设按钮 */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetR(p.r);
                setSeed((s) => s + 1);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="重抽随机样本"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 滑块调节区 */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-300 font-medium">设定皮尔逊相关系数 $r \in [-1, 1]$</span>
          <span className="font-mono text-cyan-400 font-bold text-base">r = {targetR.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.02"
          value={targetR}
          onChange={(e) => setTargetR(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>-1.0 (完全负相关 / 反向 180°)</span>
          <span>0.0 (完全不相关 / 垂直正交 90°)</span>
          <span>+1.0 (完全正相关 / 重合 0°)</span>
        </div>
      </div>

      {/* 散点图与几何夹角双视图 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧散点图 */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-200">二维特征散点云与拟合趋势线</span>
            <span className="text-cyan-400 font-mono">样本计算值 r = {actualR.toFixed(3)}</span>
          </div>

          <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
            {/* 坐标系轴 */}
            <line x1={pad} y1={toSvgY(0)} x2={svgWidth - pad} y2={toSvgY(0)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={toSvgX(0)} y1={pad} x2={toSvgX(0)} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

            {/* 回归拟合趋势线 */}
            <line
              x1={toSvgX(-range)}
              y1={toSvgY(slope * -range + intercept)}
              x2={toSvgX(range)}
              y2={toSvgY(slope * range + intercept)}
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 散点 */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={toSvgX(p.x)}
                cy={toSvgY(p.y)}
                r="4.5"
                fill="#38bdf8"
                opacity="0.8"
                stroke="#0f172a"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* 右侧：高维向量夹角与余弦相似度映射 */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              向量空间余弦相似度
            </span>
            <div className="mt-2 space-y-1">
              <div className="text-3xl font-extrabold font-mono text-cyan-400">
                {actualR.toFixed(3)}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>等价夹角 θ = {angleDeg.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* 简易单位圆向量示意 */}
          <div className="flex items-center justify-center p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <svg width="120" height="120" viewBox="-60 -60 120 120">
              <circle cx="0" cy="0" r="48" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              {/* 基准向量 v1 沿 X 轴 */}
              <line x1="0" y1="0" x2="48" y2="0" stroke="#818cf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
              {/* 目标向量 v2 旋转 theta */}
              <line
                x1="0"
                y1="0"
                x2={48 * Math.cos(-angleRad)}
                y2={48 * Math.sin(-angleRad)}
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </svg>
          </div>

          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-300 leading-relaxed">
            <strong>大模型 Attention 关联</strong>：<br />
            Q · K^T 点积本质就是衡量 Query 与 Key 之间的余弦相关度。相关度越大，注意力权重越高！
          </div>
        </div>
      </div>
    </div>
  );
};
