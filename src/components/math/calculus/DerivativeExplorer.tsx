import React, { useState } from 'react';
import { Activity, Sliders, Play, RotateCcw, Sparkles } from 'lucide-react';

interface FuncOption {
  id: string;
  name: string;
  latex: string;
  f: (x: number) => number;
  df: (x: number) => number;
  rangeX: [number, number];
  rangeY: [number, number];
}

const FUNCTIONS: FuncOption[] = [
  {
    id: 'parabola',
    name: '二次抛物线 (经典碗形损失)',
    latex: 'f(x) = x^2',
    f: (x) => x * x,
    df: (x) => 2 * x,
    rangeX: [-3, 3],
    rangeY: [-0.5, 9.5],
  },
  {
    id: 'sin',
    name: '正弦波动函数 (波浪起伏)',
    latex: 'f(x) = 2 sin(x)',
    f: (x) => 2 * Math.sin(x),
    df: (x) => 2 * Math.cos(x),
    rangeX: [-3.5, 3.5],
    rangeY: [-2.5, 2.5],
  },
  {
    id: 'cubic',
    name: '三次多谷鞍点函数 (非凸局部极小)',
    latex: 'f(x) = 0.3x^3 - x',
    f: (x) => 0.3 * Math.pow(x, 3) - x,
    df: (x) => 0.9 * x * x - 1,
    rangeX: [-3, 3],
    rangeY: [-2.5, 2.5],
  },
];

export const DerivativeExplorer: React.FC = () => {
  const [selectedFuncId, setSelectedFuncId] = useState<string>('parabola');
  const [xVal, setXVal] = useState<number>(1.2);
  const [deltaX, setDeltaX] = useState<number>(1.0); // 割线步长
  const [showSecant, setShowSecant] = useState<boolean>(true);

  const curFunc = FUNCTIONS.find((f) => f.id === selectedFuncId) || FUNCTIONS[0];

  // 几何视口映射 (SVG 520 x 280)
  const svgWidth = 520;
  const svgHeight = 280;
  const pad = 40;

  const [minX, maxX] = curFunc.rangeX;
  const [minY, maxY] = curFunc.rangeY;

  const toSvgX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (svgWidth - pad * 2);
  const toSvgY = (y: number) => svgHeight - pad - ((y - minY) / (maxY - minY)) * (svgHeight - pad * 2);

  // 生成函数采样曲线路径
  const curvePoints: { x: number; y: number }[] = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const x = minX + (i / steps) * (maxX - minX);
    const y = curFunc.f(x);
    curvePoints.push({ x: toSvgX(x), y: toSvgY(y) });
  }
  const curvePathD = curvePoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
    ''
  );

  // 计算当前点 A(x, f(x))
  const yVal = curFunc.f(xVal);
  const slope = curFunc.df(xVal); // 真实切线斜率
  const ptAx = toSvgX(xVal);
  const ptAy = toSvgY(yVal);

  // 割线点 B(x + deltaX, f(x + deltaX))
  const xB = xVal + deltaX;
  const yB = curFunc.f(xB);
  const secantSlope = (yB - yVal) / deltaX; // 割线平均变化率
  const ptBx = toSvgX(xB);
  const ptBy = toSvgY(yB);

  // 切线延伸线段 (长度固定)
  const tanLen = 1.6;
  const tanX1 = xVal - tanLen;
  const tanY1 = yVal - slope * tanLen;
  const tanX2 = xVal + tanLen;
  const tanY2 = yVal + slope * tanLen;

  // 割线延伸线段
  const secLen = 1.8;
  const secX1 = xVal - 0.4;
  const secY1 = yVal - secantSlope * 0.4;
  const secX2 = xB + 0.4;
  const secY2 = yB + secantSlope * 0.4;

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              导数与切线极限逼近实验室 (Derivative & Tangent Explorer)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            什么是导数？它不仅是公式，更是<strong>割线跨度 Δx 逼近于 0 时的瞬间切线斜率</strong>！
          </p>
        </div>

        {/* 函数切换 */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {FUNCTIONS.map((fn) => (
            <button
              key={fn.id}
              onClick={() => {
                setSelectedFuncId(fn.id);
                setXVal(0.8);
                setDeltaX(1.0);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                selectedFuncId === fn.id
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30 font-bold'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {fn.latex}
            </button>
          ))}
        </div>
      </div>

      {/* 控制滑块区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* 选择观测点 x */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">观测点坐标 x:</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">
              x = {xVal.toFixed(2)} (y = {yVal.toFixed(2)})
            </span>
          </div>
          <input
            type="range"
            min={minX + 0.3}
            max={maxX - 0.8}
            step={0.05}
            value={xVal}
            onChange={(e) => setXVal(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* 割线步长 Δx 逼近滑块 */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>割线步长 Δx:</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {deltaX < 0.1 ? '⚡ 极度逼近切线！' : '常规割线'}
              </span>
            </span>
            <span className="font-mono text-amber-400 font-bold text-sm">
              Δx = {deltaX.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.02}
            max={1.5}
            step={0.02}
            value={deltaX}
            onChange={(e) => setDeltaX(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 2D 几何图像展示 */}
      <div className="relative p-2 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          {/* 坐标网格 */}
          <line
            x1={pad}
            y1={toSvgY(0)}
            x2={svgWidth - pad}
            y2={toSvgY(0)}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={toSvgX(0)}
            y1={pad}
            x2={toSvgX(0)}
            y2={svgHeight - pad}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* 原始函数曲线 */}
          <path
            d={curvePathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 割线 (Secant Line: A 到 B) */}
          {showSecant && (
            <g>
              <line
                x1={toSvgX(secX1)}
                y1={toSvgY(secY1)}
                x2={toSvgX(secX2)}
                y2={toSvgY(secY2)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {/* 点 B */}
              <circle cx={ptBx} cy={ptBy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x={ptBx + 8} y={ptBy - 6} fill="#f59e0b" fontSize="10" fontFamily="monospace">
                B(x+Δx)
              </text>
            </g>
          )}

          {/* 真实切线 (Tangent Line at A) */}
          <line
            x1={toSvgX(tanX1)}
            y1={toSvgY(tanY1)}
            x2={toSvgX(tanX2)}
            y2={toSvgY(tanY2)}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 核心观测点 A */}
          <circle
            cx={ptAx}
            cy={ptAy}
            r="6.5"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-pulse"
          />
          <text
            x={ptAx - 15}
            y={ptAy - 12}
            fill="#a7f3d0"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            A(x)
          </text>
        </svg>

        {/* 悬浮斜率计算牌 */}
        <div className="absolute top-4 right-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md text-xs space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              真实切线斜率 (导数 f'):
            </span>
            <span className="font-mono font-black text-emerald-300 text-sm">
              {slope.toFixed(3)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              割线近似变化率 (Δy/Δx):
            </span>
            <span className="font-mono font-black text-amber-300 text-sm">
              {secantSlope.toFixed(3)}
            </span>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            当 Δx → 0 时，割线斜率精确等于切线斜率！
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 leading-relaxed">
        💡 <strong>AI 核心映射：</strong> 在训练大模型时，若损失函数对某个权重的导数 $f'(w) &gt; 0$，说明该权重稍微增加一点点就会导致模型误差上升！因此必须把该权重往回减；反之若 $f'(w) &lt; 0$，就往正方向加。这就是<strong>梯度下降</strong>的唯一起点！
      </div>
    </div>
  );
};
