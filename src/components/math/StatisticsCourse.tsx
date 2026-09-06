import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Lightbulb, Compass, ShieldCheck, BarChart3, Smile, ShieldAlert } from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { CentralLimitTheoremLab } from './statistics/CentralLimitTheoremLab';
import { LayerNormStatsLab } from './statistics/LayerNormStatsLab';
import { CorrelationLab } from './statistics/CorrelationLab';
import { ExplodingNetworkSimulator } from './statistics/ExplodingNetworkSimulator';
import { VectorCosineCompassLab } from './statistics/VectorCosineCompassLab';
import { MATH_QUIZZES } from '../../data/mathQuizzesData';
import { ActiveTab } from '../../types';

interface StatisticsCourseProps {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const StatisticsCourse: React.FC<StatisticsCourseProps> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const [isEli5Mode, setIsEli5Mode] = useState<boolean>(true);
  const statsQuizzes = MATH_QUIZZES.filter((q) => q.chapterId === 'math-statistics');

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* 课程大头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-emerald-950/50 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
              MATH FOUNDATION 03
            </span>
            <span className="text-xs text-slate-400">📊 从高维数据到稳定表征 · 统计基石</span>
          </div>

          {/* ELI5 人话模式切换开关 */}
          <button
            onClick={() => setIsEli5Mode(!isEli5Mode)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              isEli5Mode
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>{isEli5Mode ? '人话极简直觉模式 (ELI5 开启中)' : '切换至人话直觉模式'}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          统计学：海量数据下的稳定表征与归一化
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          当神经网络拥有数百层深度、训练吞吐万亿数据时，数据的数值漂移和噪声可能在第一瞬间就毁掉整个模型。
          统计学赋予了我们<strong>抽样代表性（中心极限定理）</strong>、<strong>数值稳定性（层归一化 LayerNorm）</strong>与
          <strong>高维特征相似度（皮尔逊相关与内积）</strong>的护城河。
        </p>

        {/* 人话故事卡片 (ELI5 模式特供) */}
        {isEli5Mode && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-3">
            <div className="font-bold flex items-center gap-1.5 text-sm text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>像给 5 岁小孩讲故事：统计学如何保住千亿大模型的命？</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">🏖️ 1. 抓一把沙子永远是红心 (中心极限)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  单颗沙子大小怪异，但只要你每次抓一把 30 颗称平均重量，抓 1000 次这个均值必定死死咬住正态钟形！Mini-batch 随机采样就是抓一把沙子。
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">🎧 2. 耳机的自动音量稳压阀 (LayerNorm)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  不管前几层神经元是在耳语还是爆音尖叫，LayerNorm 每一层硬生生把平均音量拉回 0 分贝、摆幅控在 1 个单位，防止第 12 层直接炸成 NaN 废纸！
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-blue-300 block">🧭 3. 指南针夹角共振 (余弦相似度)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  为什么 AI 知道“它”是指“小猫”？两个词在高维空间的指针如果指向同一个方向（夹角 0 度），余弦相似度等于 1，注意力瞬间点亮！
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 模块一：中心极限定理与小批量随机采样 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-sm flex items-center justify-center font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">中心极限定理：万物皆归高斯钟形</h2>
            <p className="text-xs text-slate-400">为什么 Mini-Batch 随机梯度下降能够代表万亿级全量数据？</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          现代统计学最著名的定理之一：不论原始总体遵循何种分布（甚至可以极其极端、不对称），
          只要独立同分布地抽取大小为 $N$ 的样本，<strong>样本均值 $\bar{'{X}'}$ 的分布都会随着 $N$ 的增大而渐进逼近正态分布！</strong>
          这不仅是统计推断的理论柱石，也正是现代深度学习能够使用几十个样本的 Mini-Batch 代替全量数据计算稳定梯度的理论支柱。
        </p>

        <MathCard
          title="中心极限定理核心公式"
          formula="\bar{X}_N \xrightarrow{d} \mathcal{N}\left(\mu, \frac{\sigma^2}{N}\right) \quad (N \to \infty)"
          plainTranslation="无论母体是什么分布，样本均值必然收敛于正态分布"
          intuition="样本均值的标准误以 1/√N 的速度收窄。Batch Size 越大估计越稳，但边际收益逐步递减。"
          tags={['中心极限', '抽样分布', 'Mini-batch']}
        />

        {/* 交互实验 1 */}
        <CentralLimitTheoremLab />
      </section>

      {/* 模块二：层归一化与 12 层灾难模拟器 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-sm flex items-center justify-center font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">LayerNorm：Transformer 的数值稳定定海神针</h2>
            <p className="text-xs text-slate-400">在每一个隐藏层中用统计均值与方差驯服激活爆炸</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          在大模型中，信号每穿过一层注意力或前馈网络，数值方差都可能成倍放大。如果不做干预，几十层后就会彻底溢出为 NaN。
          Transformer 在每个子层前后都插入了<strong>LayerNorm（层归一化）</strong>：
          对每一个 Token 内部的所有特征维度求均值 $\mu$ 与方差 $\sigma^2$，强制将其重新标准化为均值 0、方差 1 的标准形态！
        </p>

        <MathCard
          title="LayerNorm 算子标准公式"
          formula="\text{LayerNorm}(x) = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} \odot \gamma + \beta"
          plainTranslation="标准化输出 = (原始值 - 均值) / 标准差 × 可学习缩放 + 可学习偏置"
          intuition="μ 和 σ 是对当前 Token 隐层通道统计得出；γ 和 β 是模型自主学习的仿射缩放与平移参数，保持表达能力。"
          tags={['LayerNorm', '方差归一', 'Transformer']}
        />

        {/* 极限直觉舱：12 层 Transformer 数值爆炸灾难模拟器 */}
        <ExplodingNetworkSimulator />

        {/* 交互实验 2 */}
        <LayerNormStatsLab />
      </section>

      {/* 模块三：皮尔逊相关与语义向量罗盘 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-sm flex items-center justify-center font-bold">
            03
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">相关性与余弦相似度：高维语义空间的连通网</h2>
            <p className="text-xs text-slate-400">自注意力矩阵点积机制的统计学同构</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          统计学用<strong>皮尔逊相关系数（$r \in [-1, 1]$）</strong>衡量两个变量的线性联动强度。
          当变量经过零均值与单位方差标准化后，皮尔逊相关系数在几何上就完全等价于<strong>两组向量的余弦相似度（Cosine Similarity）</strong>。
          这正是 Transformer 核心注意力打分机制（Query-Key Dot Product）的数学原型！
        </p>

        {/* 极限直觉舱：语义向量磁针罗盘 */}
        <VectorCosineCompassLab />

        {/* 交互实验 3 */}
        <CorrelationLab />
      </section>

      {/* 模块四：PyTorch 代码实战 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            04
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">工程落地：PyTorch LayerNorm 与 RMSNorm</h2>
            <p className="text-xs text-slate-400">现代开源大模型 (LLaMA / Qwen) 中归一化的极致工程优化</p>
          </div>
        </div>

        <CodeBlock
          filename="statistics_layernorm_rmsnorm.py"
          language="python"
          code={`import torch
import torch.nn as nn

# 1. 经典 LayerNorm (含均值中心化与方差缩放)
batch_size, seq_len, d_model = 2, 4, 8
x = torch.randn(batch_size, seq_len, d_model) * 5 + 10 # 构造带高偏移的激活输入

ln = nn.LayerNorm(d_model)
y_ln = ln(x)

print(f"LayerNorm 后样本均值: {y_ln[0, 0].mean().item():.6f} (≈ 0.0)")
print(f"LayerNorm 后样本方差: {y_ln[0, 0].var(unbiased=False).item():.6f} (≈ 1.0)")

# 2. 现代大模型 (LLaMA / DeepSeek) 的宠儿：RMSNorm (均方根归一化)
# 统计学发现：在深层网络中，方差缩放起 90% 稳定作用，均值中心化可以省略以加速计算！
class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        # 计算均方根 (Root Mean Square)
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        return x / rms * self.weight

rms_norm = RMSNorm(d_model)
y_rms = rms_norm(x)
print(f"RMSNorm 处理后均方根范数: {torch.sqrt(torch.mean(y_rms[0, 0]**2)).item():.4f}")`}
        />
      </section>

      {/* 课程联动导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">FOUNDATION 01</span>
            <h3 className="text-lg font-bold text-white mt-1">微积分：梯度与自我修正</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              回顾割线极限导数、3D 山谷盲人探路、梯度下降，以及反向传播链式法则。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-calculus')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <span>返回微积分课程</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold">FOUNDATION 02</span>
            <h3 className="text-lg font-bold text-white mt-1">概率论与信息论</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索贝叶斯定理、高尔顿物理钉板机与大模型生成大转盘。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-probability')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <span>前往概率论与信息论</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 统计学闯关测验 */}
      <QuizModal
        chapterTitle="AI 数学基石：统计学核心测验"
        questions={statsQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
