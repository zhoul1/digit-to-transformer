import React from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Target, PieChart, Coins } from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { BayesBalanceLab } from './probability/BayesBalanceLab';
import { CrossEntropyLab } from './probability/CrossEntropyLab';
import { BinomialToGaussianLab } from './probability/BinomialToGaussianLab';
import { MATH_QUIZZES } from '../../data/mathQuizzesData';
import { ActiveTab } from '../../types';

interface ProbabilityCourseProps {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const ProbabilityCourse: React.FC<ProbabilityCourseProps> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const probQuizzes = MATH_QUIZZES.filter((q) => q.chapterId === 'math-probability');

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* 课程头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/50 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
            MATH FOUNDATION 02
          </span>
          <span className="text-xs text-slate-400">🎲 不确定性建模 · 预测概率分布</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          概率论与信息论：大模型是如何预测下一个词的？
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          大语言模型从不输出绝对真理，它输出的是对数万个词汇的<strong>条件概率分布（Conditional Probability Distribution）</strong>。
          掌握了条件概率、贝叶斯先验更新与交叉熵损失，你就看懂了大模型预训练与推理的底层思维模型！
        </p>
      </div>

      {/* 模块一：条件概率与贝叶斯天平 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-sm flex items-center justify-center font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">贝叶斯定理：动态修正认知的天平</h2>
            <p className="text-xs text-slate-400">先验概率如何在新证据到来时进化为后验概率？Prompt 工程的数学根基</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          人类常犯的直觉错误是忽视“基础概率（先验）”。著名的贝叶斯公式揭示了信念更新的黄金法则：
          <strong>后验概率 ∝ 似然度 × 先验概率</strong>。在 LLM 交互中，精心设计的 Prompt 本质就是向模型注入强烈的先验约束，
          将下一个词的候选概率空间迅速收窄到专业领域！
        </p>

        <MathCard
          title="贝叶斯法则公式 (Bayes' Rule)"
          formula="P(A | B) = \frac{P(B | A) \cdot P(A)}{P(B)}"
          plainTranslation="后验概率 = (似然度 × 先验概率) / 全概率证据"
          intuition="P(A) 是在看到新数据前的先验概率；P(B|A) 是似然度；P(B) 是全概率证据；P(A|B) 是获得新证据后更新的后验概率！"
          tags={['贝叶斯', '先验概率', '后验推断']}
        />

        {/* 交互实验 1 */}
        <BayesBalanceLab />
      </section>

      {/* 模块二：交叉熵与大模型损失函数 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-sm flex items-center justify-center font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">交叉熵：大模型预训练的终极指南针</h2>
            <p className="text-xs text-slate-400">信息论的香农熵与对数似然损失：为何对“盲目自信的错误”给予毁灭性惩罚？</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          克劳德·香农创立信息论时指出：一个概率极低的小概率事件发生时，包含的信息量极大（惊诧度 -log2(p)）。
          交叉熵损失正是将这种惊诧度作为损失惩罚：如果人类书本上真实的下一个词是“人工智能”，而模型只给了它 0.01 的概率，
          -ln(0.01) ≈ 4.6 的高额损失就会沿着网络回传，迫使权重调整，使下一次预测时该词的概率无限逼近 1.0！
        </p>

        <MathCard
          title="多分类交叉熵损失公式 (Cross-Entropy Loss)"
          formula="\mathcal{L}_{\text{CE}} = - \sum_{k=1}^K y_k \ln(\hat{y}_k) = - \ln(\hat{y}_{\text{target}})"
          plainTranslation="损失 = - ln(真实目标词的预测概率)"
          intuition="其中 y 是真实分布（One-hot 向量，真实目标类别处为 1，其余为 0）；y_hat 是经 Softmax 归一化后的模型预测概率分布。"
          tags={['交叉熵', '信息熵', '负对数似然']}
        />

        {/* 交互实验 2 */}
        <CrossEntropyLab />
      </section>

      {/* 模块三：大数定律与高斯正态分布 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-sm flex items-center justify-center font-bold">
            03
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">大数定律与高斯正态分布的涌现</h2>
            <p className="text-xs text-slate-400">海量微小扰动聚合时的必然规律：从随机掷硬币到自然界的标准钟形曲线</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          自然界与高维矩阵运算中最普遍的分布就是<strong>正态分布（高斯分布）</strong>。
          无论单个事件多么无序，只要独立重复多次，总和的概率分布一定会以期望 $\mu = np$ 为中心，平滑演化成对称的标准钟形曲线。
          这解释了为什么大语言模型在数十亿维度的初始化中，必须严密依赖高斯方差缩放。
        </p>

        {/* 交互实验 3 */}
        <BinomialToGaussianLab />
      </section>

      {/* 模块四：PyTorch 代码对照 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-sm flex items-center justify-center font-bold">
            04
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">工程对照：PyTorch 交叉熵计算与采样生成</h2>
            <p className="text-xs text-slate-400">大模型训练与文本采样推理在代码中如何实现</p>
          </div>
        </div>

        <CodeBlock
          filename="llm_cross_entropy_sampling.py"
          language="python"
          code={`import torch
import torch.nn.functional as F

# 1. 模拟大模型输出的未归一化分值 Logits (词表大小 Vocab Size = 5)
logits = torch.tensor([[2.5, 0.8, -1.2, 4.1, 0.3]], requires_grad=True)

# 2. 真实目标词的 ID (假设正确答案是第 3 个词 "Transformer")
target_token_id = torch.tensor([3])

# 3. 官方 CrossEntropyLoss (内部自动融合 LogSoftmax + NLLLoss，数值稳定性极高)
loss_fn = torch.nn.CrossEntropyLoss()
loss = loss_fn(logits, target_token_id)

print(f"交叉熵损失 Loss: {loss.item():.4f}")

# 4. 推理阶段：带温度 (Temperature) 的概率采样
temperature = 0.7
scaled_logits = logits / temperature
probs = F.softmax(scaled_logits, dim=-1)

# 按多项式概率分布进行采样 (模拟 ChatGPT 的多样化生成)
next_token = torch.multinomial(probs, num_samples=1)
print(f"采样预测的下一个 Token ID: {next_token.item()}")`}
        />
      </section>

      {/* 导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">PREVIOUS FOUNDATION</span>
            <h3 className="text-lg font-bold text-white mt-1">基础模块 01：微积分与梯度下降</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索导数瞬时倾斜度、高维损失地形多模式梯度下降、以及反向传播链式法则。
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

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold">NEXT FOUNDATION</span>
            <h3 className="text-lg font-bold text-white mt-1">进阶模块 03：统计学与数据分布</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索中心极限定理沙盒、大模型生命线 LayerNorm（均值与方差标准化），以及相关系数。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-statistics')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            <span>进入统计学课程</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 概率论测验 */}
      <QuizModal
        chapterTitle="AI 数学基石：概率论与信息论测验"
        questions={probQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
