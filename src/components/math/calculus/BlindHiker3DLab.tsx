import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Compass, Play, Pause, RotateCcw, ArrowRight, Sparkles, MapPin, Eye, Info, Footprints, ShieldAlert } from 'lucide-react';

type TerrainType = 'bowl' | 'saddle' | 'canyon';

interface TerrainDef {
  id: TerrainType;
  name: string;
  tagline: string;
  formula: string;
  lossFn: (w1: number, w2: number) => number;
  gradFn: (w1: number, w2: number) => [number, number];
  defaultPos: [number, number];
  optimalPos: [number, number];
  range: [number, number]; // [-R, R]
  maxLoss: number;
  story: string;
}

const TERRAINS: TerrainDef[] = [
  {
    id: 'bowl',
    name: '圆形大碗天坑 (Convex Bowl)',
    tagline: '最理想的温柔谷底：怎么走都能滑入大本营',
    formula: 'L(w_1, w_2) = w_1^2 + w_2^2',
    lossFn: (w1, w2) => w1 * w1 + w2 * w2,
    gradFn: (w1, w2) => [2 * w1, 2 * w2],
    defaultPos: [2.4, 2.2],
    optimalPos: [0, 0],
    range: [-3, 3],
    maxLoss: 18,
    story: '想象你在一个巨大的滑板碗池边缘。任何一个方向的坡度都直指碗底。这是凸优化的极简雏形。',
  },
  {
    id: 'saddle',
    name: '马鞍迷宫与假平原 (Saddle Point)',
    tagline: '深度学习的大敌：前后是谷、左右是峰的欺骗点',
    formula: 'L(w_1, w_2) = w_1^2 - 1.2w_2^2 + 4.5',
    lossFn: (w1, w2) => w1 * w1 - 1.2 * w2 * w2 + 4.5,
    gradFn: (w1, w2) => [2 * w1, -2.4 * w2],
    defaultPos: [0.05, 2.4],
    optimalPos: [0, 0],
    range: [-2.8, 2.8],
    maxLoss: 14,
    story: '在 (0, 0) 附近，坡度几乎完全平坦！盲人如果只看坡度大小，会误以为已经到达最低营地而停止不前。此时必须靠动量惯性冲出假死！',
  },
  {
    id: 'canyon',
    name: '狭长恶魔山峡 (Curved Canyon)',
    tagline: '两侧万仞绝壁、谷底蜿蜒前行：步长大易撞崖',
    formula: 'L(w_1, w_2) = 0.5(w_1 - 1)^2 + 3.0(w_2 - 0.5w_1^2)^2',
    lossFn: (w1, w2) => 0.5 * Math.pow(w1 - 1, 2) + 3.0 * Math.pow(w2 - 0.5 * w1 * w1, 2),
    gradFn: (w1, w2) => {
      const dw1 = (w1 - 1) - 6.0 * (w2 - 0.5 * w1 * w1) * w1;
      const dw2 = 6.0 * (w2 - 0.5 * w1 * w1);
      return [dw1, dw2];
    },
    defaultPos: [-2.0, 2.5],
    optimalPos: [1.0, 0.5],
    range: [-2.8, 2.8],
    maxLoss: 22,
    story: '两边峭壁极其陡峭，谷底却极其狭窄平缓。如果步长（学习率）稍微大一点，登山客会在两侧峭壁上来回猛烈撞击撞得头破血流！',
  },
];

export const BlindHiker3DLab: React.FC = () => {
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('bowl');
  const terrain = TERRAINS.find((t) => t.id === selectedTerrain) || TERRAINS[0];

  const [pos, setPos] = useState<[number, number]>(terrain.defaultPos);
  const [lr, setLr] = useState<number>(0.15); // 学习率 (步长)
  const [useMomentum, setUseMomentum] = useState<boolean>(false);
  const [velocity, setVelocity] = useState<[number, number]>([0, 0]);
  const [history, setHistory] = useState<[number, number][]>([terrain.defaultPos]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewAngle, setViewAngle] = useState<number>(45); // 3D 旋转视角
  const timerRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 切换地形重置
  const switchTerrain = (id: TerrainType) => {
    const t = TERRAINS.find((item) => item.id === id) || TERRAINS[0];
    setSelectedTerrain(id);
    setIsPlaying(false);
    setPos(t.defaultPos);
    setVelocity([0, 0]);
    setHistory([t.defaultPos]);
  };

  const resetPos = () => {
    setIsPlaying(false);
    setPos(terrain.defaultPos);
    setVelocity([0, 0]);
    setHistory([terrain.defaultPos]);
  };

  // 单步优化逻辑 (盲人探路一步)
  const takeStep = () => {
    const [w1, w2] = pos;
    const [gw1, gw2] = terrain.gradFn(w1, w2);

    let nextW1 = w1;
    let nextW2 = w2;
    let nextV1 = 0;
    let nextV2 = 0;

    if (useMomentum) {
      const beta = 0.85;
      nextV1 = beta * velocity[0] + lr * gw1;
      nextV2 = beta * velocity[1] + lr * gw2;
      nextW1 = w1 - nextV1;
      nextW2 = w2 - nextV2;
      setVelocity([nextV1, nextV2]);
    } else {
      nextW1 = w1 - lr * gw1;
      nextW2 = w2 - lr * gw2;
    }

    // 限制在视野内
    const r = terrain.range[1];
    nextW1 = Math.max(-r * 1.5, Math.min(r * 1.5, nextW1));
    nextW2 = Math.max(-r * 1.5, Math.min(r * 1.5, nextW2));

    const newPos: [number, number] = [nextW1, nextW2];
    setPos(newPos);
    setHistory((prev) => [...prev.slice(-80), newPos]);
  };

  // 自动循环运行
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setPos(([w1, w2]) => {
          const [gw1, gw2] = terrain.gradFn(w1, w2);
          const gradNorm = Math.sqrt(gw1 * gw1 + gw2 * gw2);

          if (gradNorm < 0.005) {
            setIsPlaying(false);
            return [w1, w2];
          }

          let nw1 = w1;
          let nw2 = w2;
          if (useMomentum) {
            const beta = 0.85;
            const nv1 = beta * velocity[0] + lr * gw1;
            const nv2 = beta * velocity[1] + lr * gw2;
            setVelocity([nv1, nv2]);
            nw1 = w1 - nv1;
            nw2 = w2 - nv2;
          } else {
            nw1 = w1 - lr * gw1;
            nw2 = w2 - lr * gw2;
          }

          const r = terrain.range[1];
          nw1 = Math.max(-r * 1.5, Math.min(r * 1.5, nw1));
          nw2 = Math.max(-r * 1.5, Math.min(r * 1.5, nw2));

          const nextP: [number, number] = [nw1, nw2];
          setHistory((h) => [...h.slice(-80), nextP]);
          return nextP;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, lr, useMomentum, terrain, velocity]);

  // Canvas 绘制 2D 等高线热力地图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const [rMin, rMax] = terrain.range;

    // 1. 栅格采样绘制等高线热力
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const maxL = terrain.maxLoss;

    for (let py = 0; py < height; py += 2) {
      const w2 = rMax - (py / height) * (rMax - rMin);
      for (let px = 0; px < width; px += 2) {
        const w1 = rMin + (px / width) * (rMax - rMin);
        const loss = terrain.lossFn(w1, w2);
        const norm = Math.min(1.0, Math.max(0, loss / maxL));

        // 经典等高线色阶: 谷底蓝青 (0) -> 绿 -> 黄 -> 峰顶红紫 (1)
        let red = 0, green = 0, blue = 0;
        if (norm < 0.25) {
          const t = norm / 0.25;
          red = 10;
          green = Math.round(50 + t * 150);
          blue = Math.round(140 + t * 115);
        } else if (norm < 0.5) {
          const t = (norm - 0.25) / 0.25;
          red = Math.round(10 + t * 200);
          green = Math.round(200 + t * 55);
          blue = Math.round(255 - t * 200);
        } else if (norm < 0.75) {
          const t = (norm - 0.5) / 0.25;
          red = Math.round(210 + t * 45);
          green = Math.round(255 - t * 150);
          blue = 40;
        } else {
          const t = (norm - 0.75) / 0.25;
          red = Math.round(255 - t * 50);
          green = Math.round(105 - t * 80);
          blue = Math.round(40 + t * 120);
        }

        // 强化等高线条纹
        const contour = Math.sin(norm * Math.PI * 14);
        if (Math.abs(contour) < 0.18) {
          red = Math.round(red * 0.4);
          green = Math.round(green * 0.4);
          blue = Math.round(blue * 0.4);
        }

        // 填充 2x2 块提升性能
        for (let dy = 0; dy < 2 && py + dy < height; dy++) {
          for (let dx = 0; dx < 2 && px + dx < width; dx++) {
            const idx = ((py + dy) * width + (px + dx)) * 4;
            data[idx] = red;
            data[idx + 1] = green;
            data[idx + 2] = blue;
            data[idx + 3] = 230;
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 坐标变换函数
    const toScreenX = (w1: number) => ((w1 - rMin) / (rMax - rMin)) * width;
    const toScreenY = (w2: number) => height - ((w2 - rMin) / (rMax - rMin)) * height;

    // 2. 绘制最佳目标营地星标
    const [optW1, optW2] = terrain.optimalPos;
    const optSx = toScreenX(optW1);
    const optSy = toScreenY(optW2);

    ctx.beginPath();
    ctx.arc(optSx, optSy, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('⭐ 谷底营地 (Target)', optSx + 12, optSy + 4);

    // 3. 绘制历史足迹轨迹
    if (history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(history[0][0]), toScreenY(history[0][1]));
      for (let i = 1; i < history.length; i++) {
        ctx.lineTo(toScreenX(history[i][0]), toScreenY(history[i][1]));
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 足迹圆点
      history.forEach(([hw1, hw2], idx) => {
        ctx.beginPath();
        ctx.arc(toScreenX(hw1), toScreenY(hw2), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#fbbf24' : 'rgba(244, 63, 94, 0.8)';
        ctx.fill();
      });
    }

    // 4. 绘制当前盲人登山客与下山箭头
    const [curW1, curW2] = pos;
    const curSx = toScreenX(curW1);
    const curSy = toScreenY(curW2);

    const [gw1, gw2] = terrain.gradFn(curW1, curW2);

    // 负梯度下山方向 (反向)
    const arrowLen = Math.min(45, Math.max(12, Math.sqrt(gw1 * gw1 + gw2 * gw2) * 12));
    const angle = Math.atan2(-gw2, -gw1);

    const arrowEndX = curSx + Math.cos(angle) * arrowLen;
    const arrowEndY = curSy - Math.sin(angle) * arrowLen;

    // 下山推力光束
    ctx.beginPath();
    ctx.moveTo(curSx, curSy);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 箭头头部
    ctx.beginPath();
    ctx.arc(arrowEndX, arrowEndY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // 登山客本体光环
    ctx.beginPath();
    ctx.arc(curSx, curSy, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(curSx, curSy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [pos, history, terrain]);

  // 用户点击 Canvas 放置登山客
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const [rMin, rMax] = terrain.range;
    const w1 = rMin + (clickX / canvas.width) * (rMax - rMin);
    const w2 = rMax - (clickY / canvas.height) * (rMax - rMin);

    const newP: [number, number] = [parseFloat(w1.toFixed(2)), parseFloat(w2.toFixed(2))];
    setIsPlaying(false);
    setPos(newP);
    setVelocity([0, 0]);
    setHistory([newP]);
  };

  const currentLoss = terrain.lossFn(pos[0], pos[1]);
  const [gradW1, gradW2] = terrain.gradFn(pos[0], pos[1]);
  const slopeStrength = Math.sqrt(gradW1 * gradW1 + gradW2 * gradW2);

  return (
    <div className="bg-[#0b101b] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题与场景切换 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              🏔️ 极限直觉舱 01
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              三维山谷：黑夜中的盲人探路者 (The Blind Hiker)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            <strong>核心直觉</strong>：如果网络有 1000 亿个参数，没人能在高维空间“看清”全貌。AI
            就像深夜被空投到崇山峻岭的盲人，每走一步只能用脚底感受倾斜度（负梯度方向），然后摸黑往前迈一步！
          </p>
        </div>

        {/* 地形选择 */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0">
          {TERRAINS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTerrain(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTerrain === t.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {t.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 场景生动故事解读条 */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
        <Footprints className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-white block">{terrain.tagline}</span>
          <span className="text-slate-300">{terrain.story}</span>
        </div>
      </div>

      {/* 主展示区：等高线地形图 + 盲人脚底传感器仪表盘 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：等高线交互 Canvas */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              损失地形等高线图 (点击地图任意点重新降落登山客)
            </span>
            <span className="text-rose-400 font-mono text-[11px]">红色为陡峭山脊，深蓝为谷底营地</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={420}
              height={320}
              onClick={handleCanvasClick}
              className="block w-full max-w-[420px] h-auto"
            />
            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-400 border border-slate-800">
              当前坐标: ({pos[0].toFixed(2)}, {pos[1].toFixed(2)})
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>步数记录: {history.length - 1} 步</span>
            <span className="text-indigo-400 font-mono">红箭头 = -∇L(w) 盲人脚感下山推力</span>
            <span>目标: 全局极小 (⭐)</span>
          </div>
        </div>

        {/* 右侧：盲人感官仪表盘与超参数控制 */}
        <div className="lg:col-span-5 space-y-4">
          {/* 脚感实时读数 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                👣 盲人脚底触感读数 (Gradient Sensor)
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  slopeStrength < 0.1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {slopeStrength < 0.1 ? '平缓谷底或假死鞍点' : '陡峭下坡冲刺中'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">当前海拔高度 (Loss)</span>
                <span className="text-xl font-mono font-black text-white">{currentLoss.toFixed(3)}</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">脚下倾斜陡峭度 (||∇L||)</span>
                <span className="text-xl font-mono font-black text-rose-400">{slopeStrength.toFixed(3)}</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">参数 w₁ (东西倾角)</span>
                <span className="text-sm font-mono font-bold text-cyan-300">{gradW1.toFixed(3)}</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">参数 w₂ (南北倾角)</span>
                <span className="text-sm font-mono font-bold text-purple-300">{gradW2.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* 步长调节与动量控制 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-200 font-semibold">步长步伐大小 η (Learning Rate)</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">{lr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.8"
                step="0.02"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.02 (蚂蚁挪步)</span>
                <span>0.15 (平稳快步)</span>
                <span>0.80 (大步扯蛋撞悬崖)</span>
              </div>
            </div>

            {/* 惯性动量 (冲破鞍点假死) */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMomentum}
                    onChange={(e) => setUseMomentum(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>开启质量惯性动量 (Momentum)</span>
                </label>
                {useMomentum && <span className="text-[10px] text-purple-400 font-mono font-bold">β = 0.85</span>}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                给登山客一辆雪橇！当遇到“平坦鞍点”或“两侧横跳狭谷”时，凭借此前冲下来的惯性，一口气冲出假死平原。
              </p>
            </div>

            {/* 控制按钮群 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? '暂停下山' : '连续自动摸索下山'}</span>
              </button>

              <button
                disabled={isPlaying}
                onClick={takeStep}
                className="flex items-center justify-center gap-1 py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                title="单步摸索"
              >
                <ArrowRight className="w-4 h-4" />
                <span>迈一步</span>
              </button>

              <button
                onClick={resetPos}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700 cursor-pointer"
                title="重置位置"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
