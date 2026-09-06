import React, { useState, useRef, useEffect } from 'react';
import { Compass, Sparkles, Sliders, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

interface WordPair {
  id: string;
  wordA: string;
  wordB: string;
  angleDeg: number;
  description: string;
  attentionInterpretation: string;
}

const WORD_PAIRS: WordPair[] = [
  {
    id: 'king-queen',
    wordA: '国王 (King)',
    wordB: '王后 (Queen)',
    angleDeg: 15,
    description: '在词嵌入空间中，高贵王室统治者语义高度重叠，夹角极小！',
    attentionInterpretation: 'Attention 权重 > 0.95：注意力雷达被瞬间点亮！',
  },
  {
    id: 'cat-dog',
    wordA: '猫 (Cat)',
    wordB: '小狗 (Dog)',
    angleDeg: 28,
    description: '都是四足家庭毛茸茸宠物，共享极多上下文语境。',
    attentionInterpretation: 'Attention 权重约 0.88：强上下文关联。',
  },
  {
    id: 'apple-quantum',
    wordA: '红富士苹果 (Apple)',
    wordB: '量子纠缠 (Quantum)',
    angleDeg: 90,
    description: '水果与高能前沿物理，在人类语料库中几乎从不同时发生联系（正交垂直）。',
    attentionInterpretation: 'Attention 权重 ≈ 0.00：自注意力矩阵直接过滤忽略。',
  },
  {
    id: 'hot-cold',
    wordA: '滚烫酷热 (Hot)',
    wordB: '极度严寒 (Cold)',
    angleDeg: 165,
    description: '互为极端反义词，向量方向背道而驰！',
    attentionInterpretation: '内积为负：在无约束点积中受到强负抑制。',
  },
];

export const VectorCosineCompassLab: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<number>(20);
  const [selectedPairId, setSelectedPairId] = useState<string>('king-queen');

  const curPair = WORD_PAIRS.find((p) => p.id === selectedPairId) || WORD_PAIRS[0];

  const handleSelectPair = (id: string) => {
    const p = WORD_PAIRS.find((item) => item.id === id) || WORD_PAIRS[0];
    setSelectedPairId(id);
    setAngleDeg(p.angleDeg);
  };

  const rad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);

  // Canvas 绘制罗盘
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 25;

    ctx.clearRect(0, 0, size, size);

    // 绘制罗盘底盘
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制十字基准线
    ctx.beginPath();
    ctx.moveTo(center - radius, center);
    ctx.lineTo(center + radius, center);
    ctx.moveTo(center, center - radius);
    ctx.lineTo(center, center + radius);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制刻度环与夹角弧扇
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, 45, 0, -rad, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 向量 A (固定在水平 0 度，紫色)
    const len = radius - 15;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + len, center);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 向量 A 箭头
    ctx.beginPath();
    ctx.arc(center + len, center, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.fill();

    // 向量 B (根据 angleDeg 旋转，青色)
    const bx = center + len * Math.cos(-rad);
    const by = center + len * Math.sin(-rad);

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 向量 B 箭头
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // 中心转轴圆环
    ctx.beginPath();
    ctx.arc(center, center, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [angleDeg, rad]);

  return (
    <div className="bg-[#0b101b] border border-blue-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题与场景切换 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              🧭 几何直觉舱 05
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              语义向量罗盘：自注意力 Q·K^T 的几何真相 (Vector Compass)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            <strong>核心直觉</strong>：为什么 Transformer 能知道“它”指代“小猫”？
            因为在数百维嵌入空间里，两个词向量只要朝向相同（夹角 $\theta \to 0$），余弦相似度就等于 1，注意力连线被疯狂点亮！
          </p>
        </div>

        {/* 经典词对预设 */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0">
          {WORD_PAIRS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPair(p.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedPairId === p.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {p.wordA.split(' ')[0]} ↔ {p.wordB.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 主展示区：罗盘 Canvas + 余弦相似度仪表盘 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 左侧：磁针罗盘 */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <canvas ref={canvasRef} width={280} height={280} className="block drop-shadow-xl" />
          <div className="flex items-center gap-6 mt-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-purple-300 font-bold">
              <span className="w-3 h-1 bg-purple-400 rounded inline-block" />
              向量 A: {curPair.wordA}
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-3 h-1 bg-cyan-400 rounded inline-block" />
              向量 B: {curPair.wordB}
            </span>
          </div>
        </div>

        {/* 右侧：滑块、余弦值与 Attention 映射 */}
        <div className="lg:col-span-7 space-y-4">
          {/* 滑块自由调节夹角 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">自由拖动两向量夹角 θ (Angle):</span>
              <span className="font-mono text-cyan-400 font-black text-lg">{angleDeg}°</span>
            </div>

            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={angleDeg}
              onChange={(e) => setAngleDeg(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0° (完美重叠 cos=1)</span>
              <span>90° (垂直无关 cos=0)</span>
              <span>180° (反向对立 cos=-1)</span>
            </div>
          </div>

          {/* 余弦相似度大数值卡片 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                余弦相似度 Cosine Similarity
              </span>
              <span className="text-xs font-mono text-slate-400">cos(θ) = (A · B) / (||A|| ||B||)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono ${
                  cosVal > 0.7 ? 'text-emerald-400' : cosVal > 0.2 ? 'text-blue-400' : cosVal > -0.2 ? 'text-slate-400' : 'text-rose-400'
                }`}
              >
                {cosVal.toFixed(4)}
              </span>
              <span className="text-xs font-bold text-slate-300">
                {cosVal > 0.8
                  ? '🔥 语义极强关联 (高注意力)'
                  : cosVal > 0.3
                  ? '⚡ 语义中度关联'
                  : cosVal > -0.3
                  ? '⚪ 毫无关联 (无关噪声)'
                  : '❄️ 语义反向对立'}
              </span>
            </div>

            {/* 场景生动解读 */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-cyan-300 font-bold">{curPair.description}</div>
              <div className="text-slate-400">{curPair.attentionInterpretation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
