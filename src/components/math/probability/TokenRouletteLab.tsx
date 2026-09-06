import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCw, Sparkles, Sliders, Dices, Flame, Snowflake, CheckCircle2 } from 'lucide-react';

interface PromptOption {
  id: string;
  context: string;
  candidates: { token: string; rawScore: number; color: string }[];
}

const PROMPT_PRESETS: PromptOption[] = [
  {
    id: 'poetry',
    context: '床前明月光，疑是地上 _____',
    candidates: [
      { token: '霜 (Frost)', rawScore: 4.8, color: '#38bdf8' },
      { token: '雪 (Snow)', rawScore: 1.8, color: '#818cf8' },
      { token: '糖 (Sugar)', rawScore: -0.5, color: '#f43f5e' },
      { token: '光 (Light)', rawScore: 0.2, color: '#fbbf24' },
      { token: '金 (Gold)', rawScore: -1.2, color: '#34d399' },
    ],
  },
  {
    id: 'code',
    context: 'def calculate_loss(pred, target): _____',
    candidates: [
      { token: 'return', rawScore: 4.2, color: '#10b981' },
      { token: 'loss =', rawScore: 3.1, color: '#06b6d4' },
      { token: 'print', rawScore: 1.2, color: '#8b5cf6' },
      { token: 'while', rawScore: -1.5, color: '#f59e0b' },
      { token: 'banana', rawScore: -4.0, color: '#ef4444' },
    ],
  },
  {
    id: 'creative',
    context: '在遥远的赛博朋克 2077 年，仿生人开始梦想着 _____',
    candidates: [
      { token: '电子羊 (Electric Sheep)', rawScore: 3.6, color: '#ec4899' },
      { token: '自由 (Freedom)', rawScore: 3.2, color: '#a855f7' },
      { token: '火星 (Mars)', rawScore: 1.8, color: '#3b82f6' },
      { token: '加班 (Overtime)', rawScore: -0.2, color: '#f97316' },
      { token: '烧烤 (BBQ)', rawScore: -1.5, color: '#eab308' },
    ],
  },
];

export const TokenRouletteLab: React.FC = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('poetry');
  const [temperature, setTemperature] = useState<number>(0.8);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const curPreset = PROMPT_PRESETS.find((p) => p.id === selectedPromptId) || PROMPT_PRESETS[0];

  // 核心 Softmax 带温度计算
  // prob_i = exp(score_i / T) / sum(exp(score_j / T))
  const safeTemp = Math.max(0.05, temperature);
  const scaledScores = curPreset.candidates.map((c) => c.rawScore / safeTemp);
  const maxScaled = Math.max(...scaledScores);
  const expScores = scaledScores.map((s) => Math.exp(s - maxScaled));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probs = expScores.map((e) => e / sumExp);

  // 计算每个扇区的起始和终止角度 (弧度)
  let accumulatedAngle = 0;
  const sectors = curPreset.candidates.map((cand, idx) => {
    const angleSpan = probs[idx] * Math.PI * 2;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angleSpan;
    accumulatedAngle += angleSpan;
    return {
      ...cand,
      prob: probs[idx],
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
    };
  });

  // 旋转转盘抽样
  const spinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedResult(null);

    // 随机选择目标概率落点
    const rand = Math.random();
    let cumulative = 0;
    let chosenIdx = 0;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) {
        chosenIdx = i;
        break;
      }
    }

    // 目标扇区中心角度
    const targetSector = sectors[chosenIdx];
    // 指针在顶部 (3 * PI / 2 即 270度)
    // 需要将 targetSector.midAngle 转到 270 度
    const targetMid = targetSector.midAngle;
    const extraSpins = (4 + Math.floor(Math.random() * 3)) * 360; // 额外空转 4-6 圈
    const targetDegree = 270 - (targetMid * 180) / Math.PI;
    const finalRotation = wheelRotation + extraSpins + (targetDegree - (wheelRotation % 360));

    setWheelRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedResult(targetSector.token);
    }, 2800);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 绘制大转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 14;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((wheelRotation * Math.PI) / 180);

    // 绘制扇区
    sectors.forEach((sec) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, sec.startAngle, sec.endAngle);
      ctx.closePath();
      ctx.fillStyle = sec.color;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 文字标签 (扇形面积大于一定值才显示内部文字)
      if (sec.prob > 0.04) {
        ctx.save();
        ctx.rotate(sec.midAngle);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        const labelText = sec.token.split(' ')[0];
        ctx.fillText(`${labelText} (${(sec.prob * 100).toFixed(0)}%)`, radius - 16, 4);
        ctx.restore();
      }
    });

    // 转盘外圈边框
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 中心装饰圆盘
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }, [sectors, wheelRotation]);

  return (
    <div className="bg-[#0b101b] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题与场景切换 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              🎡 概率直觉舱 03
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              大模型生成大转盘：Softmax 概率轮盘赌 (Token Roulette)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            <strong>核心直觉</strong>：大模型每吐出一个字，底层并不是在“思考”，而是在转动一个轮盘！
            每个候选词的扇形面积就是它的 Softmax 概率。调整 Temperature，就是改变扇区的分配方式！
          </p>
        </div>

        {/* 预设上下文切换 */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0">
          {PROMPT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptId(p.id);
                setSelectedResult(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPromptId === p.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {p.id === 'poetry' ? '📜 诗歌续写' : p.id === 'code' ? '💻 Python 代码' : '🚀 赛博科幻'}
            </button>
          ))}
        </div>
      </div>

      {/* 当前提示词展示 */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">当前 Prompt 语境:</span>
          <div className="text-base sm:text-lg font-bold text-white font-mono">{curPreset.context}</div>
        </div>
        {selectedResult && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>生成命中: "{selectedResult}"</span>
          </div>
        )}
      </div>

      {/* 主展示区：轮盘 Canvas + 概率条与温度控制器 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 左侧：物理大转盘 */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 relative">
          {/* 指针 (固定的顶部指针) */}
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-500 filter drop-shadow-md" />
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="block rounded-full shadow-2xl transition-transform"
              style={{
                transition: isSpinning ? 'transform 2.8s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              }}
            />
          </div>

          {/* 旋转抽样按钮 */}
          <button
            disabled={isSpinning}
            onClick={spinRoulette}
            className={`mt-4 flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl cursor-pointer ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? '指针狂旋抽样中...' : 'SPIN! 旋转轮盘生成下一个词'}</span>
          </button>
        </div>

        {/* 右侧：温度控制器与各扇区概率分布直观条 */}
        <div className="lg:col-span-6 space-y-4">
          {/* 温度控制滑块 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                {temperature < 0.4 ? (
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Flame className="w-4 h-4 text-rose-400" />
                )}
                <span>采样温度 (Temperature):</span>
              </div>
              <span className="font-mono text-cyan-400 font-black text-base">{temperature.toFixed(2)}</span>
            </div>

            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.10 (极低温：死记硬背，赢家通吃)</span>
              <span>0.80 (黄金平衡)</span>
              <span>2.00 (高烧胡言：随机群魔乱舞)</span>
            </div>
          </div>

          {/* 各候选词概率面积条 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">
              📊 扇区面积切片 (Softmax 概率分布)
            </span>

            {sectors.map((sec) => (
              <div key={sec.token} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{sec.token}</span>
                  <span className="font-mono font-bold text-white">{(sec.prob * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{
                      width: `${sec.prob * 100}%`,
                      backgroundColor: sec.color,
                    }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs text-cyan-200/90 leading-relaxed">
            💡 <strong>直觉秒懂</strong>：温度 $T$ 越低，最大概率词的扇区急剧膨胀，占满整张转盘，大模型输出极度稳定可预测；
            温度 $T$ 越高，所有扇区被压平变均匀，甚至连低俗荒诞词也有机会被指针戳中（胡言乱语 / 幻觉）！
          </div>
        </div>
      </div>
    </div>
  );
};
