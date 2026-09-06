import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Sparkles, RefreshCw, Zap, Sliders } from 'lucide-react';

interface Bead {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  settled: boolean;
  color: string;
}

interface Peg {
  x: number;
  y: number;
  r: number;
}

export const GaltonBoardPhysicsLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [beadCount, setBeadCount] = useState<number>(0);
  const [showGaussianFit, setShowGaussianFit] = useState<boolean>(true);
  const [pegRows, setPegRows] = useState<number>(10);

  // 状态储存
  const beadsRef = useRef<Bead[]>([]);
  const binsRef = useRef<number[]>(new Array(11).fill(0));
  const animationFrameRef = useRef<number | null>(null);
  const dropCounterRef = useRef<number>(0);

  // 尺寸常量
  const width = 520;
  const height = 440;
  const funnelY = 35;
  const pegStartY = 75;
  const pegSpacingY = 24;
  const binTopY = pegStartY + 10 * pegSpacingY + 15;
  const binBottomY = height - 15;

  // 生成钉子网格
  const pegs = useMemo(() => {
    const pList: Peg[] = [];
    const centerX = width / 2;
    for (let row = 0; row < pegRows; row++) {
      const count = row + 1;
      const startX = centerX - ((count - 1) * 26) / 2;
      const y = pegStartY + row * pegSpacingY;
      for (let col = 0; col < count; col++) {
        pList.push({
          x: startX + col * 26,
          y: y,
          r: 3.5,
        });
      }
    }
    return pList;
  }, [pegRows]);

  // 槽位数量 = pegRows + 1
  const numBins = pegRows + 1;
  const binWidth = (pegs[pegs.length - 1].x - pegs[pegs.length - pegRows].x + 26) / numBins;
  const binStartX = (width - numBins * binWidth) / 2;

  // 初始化或重置
  const resetBoard = () => {
    setIsDropping(false);
    beadsRef.current = [];
    binsRef.current = new Array(numBins).fill(0);
    setBeadCount(0);
  };

  // 生成单颗微型弹珠
  const spawnBead = () => {
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#34d399', '#fbbf24'];
    const bead: Bead = {
      x: width / 2 + (Math.random() - 0.5) * 6,
      y: funnelY,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 1.5,
      r: 3.2,
      settled: false,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    beadsRef.current.push(bead);
    setBeadCount((c) => c + 1);
  };

  // 倾倒 250 颗
  const floodBeads = (amount = 200) => {
    for (let i = 0; i < amount; i++) {
      setTimeout(() => {
        spawnBead();
      }, i * 16);
    }
  };

  // 物理模拟与绘制循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravity = 0.22;
    const bounce = 0.45;
    const friction = 0.98;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 背景微网格
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, width, height);

      // 漏斗漏嘴
      ctx.beginPath();
      ctx.moveTo(width / 2 - 40, 5);
      ctx.lineTo(width / 2 - 8, funnelY);
      ctx.lineTo(width / 2 - 8, funnelY + 12);
      ctx.moveTo(width / 2 + 40, 5);
      ctx.lineTo(width / 2 + 8, funnelY);
      ctx.lineTo(width / 2 + 8, funnelY + 12);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 绘制阻挡钉子
      pegs.forEach((p: Peg) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 绘制底部收集槽隔板
      for (let i = 0; i <= numBins; i++) {
        const x = binStartX + i * binWidth;
        ctx.beginPath();
        ctx.moveTo(x, binTopY);
        ctx.lineTo(x, binBottomY);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 绘制槽内已沉淀弹珠柱状高度
      const maxInBin = Math.max(...binsRef.current, 1);
      const binMaxHeight = binBottomY - binTopY - 10;

      binsRef.current.forEach((count, idx) => {
        const x = binStartX + idx * binWidth;
        const barH = (count / maxInBin) * binMaxHeight;
        const y = binBottomY - barH;

        // 柱体渐变
        const grad = ctx.createLinearGradient(0, y, 0, binBottomY);
        grad.addColorStop(0, '#818cf8');
        grad.addColorStop(1, '#3b82f6');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1.5, y, binWidth - 3, barH);

        // 槽顶数字
        if (count > 0) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${count}`, x + binWidth / 2, Math.max(binTopY + 10, y - 3));
        }
      });

      // 拟合高斯正态钟形理论曲线
      if (showGaussianFit && beadCount > 20) {
        const meanBin = (numBins - 1) / 2;
        const stdBin = Math.sqrt(pegRows * 0.25); // 二项分布标准差 sqrt(n*p*(1-p))

        ctx.beginPath();
        for (let xPixel = binStartX; xPixel <= binStartX + numBins * binWidth; xPixel += 3) {
          const binCoord = (xPixel - binStartX) / binWidth;
          const factor = 1 / (stdBin * Math.sqrt(2 * Math.PI));
          const expo = -0.5 * Math.pow((binCoord - meanBin) / stdBin, 2);
          const theoreticalH = factor * Math.exp(expo) * (binMaxHeight * 1.6);
          const curveY = binBottomY - theoreticalH;

          if (xPixel === binStartX) {
            ctx.moveTo(xPixel, curveY);
          } else {
            ctx.lineTo(xPixel, curveY);
          }
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 更新并绘制动态弹珠
      const activeBeads: Bead[] = [];
      const beads = beadsRef.current;

      for (let i = 0; i < beads.length; i++) {
        const b = beads[i];
        if (b.settled) continue;

        b.vy += gravity;
        b.vx *= friction;
        b.x += b.vx;
        b.y += b.vy;

        // 碰撞钉子检测
        for (let pIdx = 0; pIdx < pegs.length; pIdx++) {
          const p = pegs[pIdx];
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.r + p.r;

          if (dist < minDist) {
            // 弹性反弹并施加微小的左右随机扰动 (50% 抛硬币效应)
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            const dot = b.vx * nx + b.vy * ny;

            b.vx = (b.vx - 2 * dot * nx) * bounce + (Math.random() - 0.5) * 0.6;
            b.vy = (b.vy - 2 * dot * ny) * bounce;

            // 纠正穿透
            b.x = p.x + nx * minDist;
            b.y = p.y + ny * minDist;
          }
        }

        // 掉入收集槽判定
        if (b.y >= binBottomY - 5) {
          b.settled = true;
          // 计算落入哪个槽
          const binIdx = Math.floor((b.x - binStartX) / binWidth);
          if (binIdx >= 0 && binIdx < numBins) {
            binsRef.current[binIdx]++;
          }
        } else {
          activeBeads.push(b);
        }

        // 绘制弹珠小球
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }

      // 仅保留活跃弹珠
      beadsRef.current = activeBeads;

      // 持续掉球发生器
      if (isDropping) {
        dropCounterRef.current++;
        if (dropCounterRef.current % 3 === 0) {
          spawnBead();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [pegs, isDropping, numBins, binWidth, binStartX, showGaussianFit, beadCount]);

  return (
    <div className="bg-[#0b101b] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              🎲 物理直觉舱 02
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              高尔顿物理钉板机：亲眼见证高斯钟形曲线的诞生 (The Galton Board)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            <strong>零数学门槛</strong>：每颗弹珠每次撞钉子，只有 50% 往左、50% 往右。但当几百颗弹珠自由落下后，
            <strong>无序的离散微随机，在宏观上必然凝聚成严丝合缝的高斯正态分布！</strong>
          </p>
        </div>

        {/* 理论曲线开关 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGaussianFit(!showGaussianFit)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              showGaussianFit
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showGaussianFit ? '⚡ 理论钟形曲线 (已开启)' : '显示理论正态曲线'}
          </button>
        </div>
      </div>

      {/* 主展示区：Canvas 物理模拟 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              60 FPS 实时重力弹性碰撞模拟器
            </span>
            <span className="font-mono text-purple-300 font-bold">已掉落弹珠: {beadCount} 颗</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <canvas ref={canvasRef} width={width} height={height} className="block w-full max-w-[520px] h-auto" />
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 mt-3 px-1">
            <span>钉子层数: {pegRows} 层</span>
            <span className="text-amber-400 font-mono">黄色虚线 = 理论中心极限定理正态分布</span>
            <span>撞击概率: 50% / 50%</span>
          </div>
        </div>

        {/* 右侧：控制面板与大模型深层认知 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
              🎮 物理实验发射台
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsDropping(!isDropping)}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                  isDropping
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
                }`}
              >
                {isDropping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isDropping ? '暂停水流' : '持续落球'}</span>
              </button>

              <button
                onClick={() => floodBeads(200)}
                className="flex items-center justify-center gap-1 py-3 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>倾倒 200 颗</span>
              </button>
            </div>

            <button
              onClick={resetBoard}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清空所有弹珠槽</span>
            </button>
          </div>

          {/* 破除数学心魔：为什么中间多两边少？ */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              💡 极简人话：为什么中间总是堆成小山？
            </span>
            <p className="text-slate-300 leading-relaxed">
              要落到最左边的槽，必须连续 10 次每一次都极其碰巧弹向左边（概率是 $(1/2)^{10} \approx 0.1\%$）；
              而要落到中间的槽，只要 5 次向左、5 次向右即可，在排列组合里有高达 <strong>252 种不同路径！</strong>
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed border-t border-slate-800 pt-2">
              <strong>与 ChatGPT 的直接联系</strong>：
              Transformer 内部每个 Token 的特征都是数千个微小词义分量的加权累加。正是这个物理原理保证了深层特征不会杂乱无章，而是天然聚拢在优雅的高斯分布中！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
