import React from 'react';
import { Brain, Sparkles, ArrowRight, Layers, Sliders, BarChart, Compass } from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { CentralLimitTheoremLab } from './statistics/CentralLimitTheoremLab';
import { LayerNormStatsLab } from './statistics/LayerNormStatsLab';
import { CorrelationLab } from './statistics/CorrelationLab';
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
  const statsQuizzes = MATH_QUIZZES.filter((q) => q.chapterId === 'math-statistics');

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* 课程大头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-indigo-950/50 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
            MATH FOUNDATION 03
          </span>
          <span className="text-xs text-slate-400">📊 统计分布 · 隐层归一化 · 向量相关性</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          统计学与数据分布：打造百亿参数模型的稳健底座
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          为什么只需 128 条样本的批次就能代表全人类语料的梯度方向？为什么 100 层的 Transformer
          内部数据不会爆炸或崩溃？从<strong>中心极限定理</strong>、<strong>均值与方差层归一化（LayerNorm）</strong>，到<strong>高维语义向量的相关性</strong>，统计学为巨型 AI 提供了坚如磐石的稳定性保障。
        </p>
      </div>

      {/* 模块一：中心极限定理 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-sm flex items-center justify-center font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">中心极限定理：随机混沌中的秩序奇迹</h2>
            <p className="text-xs text-slate-400">无论母体多么怪异偏斜，大量样本均值的分布必然趋向标准高斯正态！</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          中心极限定理（CLT）是近代数理统计学皇冠上的明珠：假定母体拥有任意分布（双峰、长尾偏态或离散阶梯），
          只要抽取样本容量 N ≥ 30，样本均值 X̄ 的分布必定渐进服从正态分布 N(μ, σ²/N)。
          这是现代机器学习中 <strong>Mini-batch 梯度下降</strong> 能够稳定替代全量数据计算的根本原因！
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

      {/* 模块二：LayerNorm 与大模型内部协变量稳定 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">层归一化 (LayerNorm)：驯服百层巨网的数值猛兽</h2>
            <p className="text-xs text-slate-400">均值归零、方差定锚：Transformer 每一层必经的统计学滤网</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          深层神经网络训练时面临的头号梦魇是“内部协变量偏移”（Internal Covariate Shift）——前几层权重的微小改动，会在数十层传递后导致特征数值剧烈膨胀或萎缩。
          LayerNorm 巧妙地针对单个 Token 自身的隐层维度计算统计均值 μ 与方差 σ²，强制把激活值重标定在稳定的零中心区间！
        </p>

        <MathCard
          title="LayerNorm 算子标准公式"
          formula="\text{LayerNorm}(x) = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} \odot \gamma + \beta"
          plainTranslation="标准化输出 = (原始值 - 均值) / 标准差 × 可学习缩放 + 可学习偏置"
          intuition="μ 和 σ 是对当前 Token 隐层通道统计得出；γ 和 β 是模型自主学习的仿射缩放与平移参数，保持表达能力。"
          tags={['LayerNorm', '方差归一', 'Transformer']}
        />

        {/* 交互实验 2 */}
        <LayerNormStatsLab />
      </section>

      {/* 模块三：相关系数与向量余弦相似度 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-sm flex items-center justify-center font-bold">
            03
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">皮尔逊相关系数与余弦相似度：语义关联的几何度量</h2>
            <p className="text-xs text-slate-400">从统计协方差到自注意力机制的 Q · K^T 矩阵点积</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          统计学中的皮尔逊相关系数 r 度量两个变量的线性关联度；在去中心化后，它完全等价于高维欧氏空间中两向量夹角的<strong>余弦相似度 cos(θ)</strong>。
          Transformer 的核心——注意力打分机制 QK^T / √d_k，本质上就是在统计学空间中计算词语意图与上下文特征的相关强度！
        </p>

        {/* 交互实验 3 */}
        <CorrelationLab />
      </section>

      {/* 模块四：PyTorch 工业代码对照 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-sm flex items-center justify-center font-bold">
            04
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">工程落地：PyTorch LayerNorm 与余弦相似度</h2>
            <p className="text-xs text-slate-400">大模型内部最常用的两组统计学核心算子</p>
          </div>
        </div>

        <CodeBlock
          filename="transformer_stats_layernorm.py"
          language="python"
          code={`import torch
import torch.nn as nn
import torch.nn.functional as F

# 1. 模拟一个 Batch 的 Token 隐层向量 [Batch=2, SeqLen=3, HiddenDim=4]
x = torch.randn(2, 3, 4) * 5.0 + 10.0  # 模拟存在严重均值与方差偏移

# 2. 声明 Transformer 标准层归一化层 (针对最后一个维度 4 进行归一化)
ln = nn.LayerNorm(normalized_shape=4)
y = ln(x)

# 验证统计量：均值归零，方差恒为 1！
print(f"归一化后第 1 个 Token 的均值: {y[0, 0].mean().item():.4f}")
print(f"归一化后第 1 个 Token 的方差: {y[0, 0].var(unbiased=False).item():.4f}")

# 3. 计算 Query 向量与 Key 向量的统计余弦相似度
query = torch.tensor([[1.0, 2.0, 0.5, 3.0]])
key   = torch.tensor([[0.9, 1.8, 0.6, 2.9]])

cos_sim = F.cosine_similarity(query, key)
print(f"语义相似度相关系数 r: {cos_sim.item():.4f}")`}
        />
      </section>

      {/* 导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">FOUNDATION 01</span>
            <h3 className="text-lg font-bold text-white mt-1">基础模块 01：微积分与梯度下降</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索导数瞬时切线、多地形梯度下降模拟舱与反向传播计算图。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-calculus')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <span>复习微积分课程</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold">FOUNDATION 02</span>
            <h3 className="text-lg font-bold text-white mt-1">基础模块 02：概率论与信息论</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索贝叶斯天平假阳性、交叉熵 Next-Token 惩罚机制与高斯正态涌现。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-probability')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <span>复习概率论课程</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 统计学测验 */}
      <QuizModal
        chapterTitle="AI 数学基石：统计学与数据分布测验"
        questions={statsQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
