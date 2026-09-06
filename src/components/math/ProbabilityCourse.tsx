import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Lightbulb, Compass, BarChart, Smile, Dices, Flame } from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { BayesBalanceLab } from './probability/BayesBalanceLab';
import { CrossEntropyLab } from './probability/CrossEntropyLab';
import { BinomialToGaussianLab } from './probability/BinomialToGaussianLab';
import { GaltonBoardPhysicsLab } from './probability/GaltonBoardPhysicsLab';
import { TokenRouletteLab } from './probability/TokenRouletteLab';
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
  const [isEli5Mode, setIsEli5Mode] = useState<boolean>(true);
  const probQuizzes = MATH_QUIZZES.filter((q) => q.chapterId === 'math-probability');

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* 课程大头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/50 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
              MATH FOUNDATION 02
            </span>
            <span className="text-xs text-slate-400">🎲 拥抱不确定性 · 驾驭概率分布</span>
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
          概率论与信息论：大模型如何理解世界的“不确定性”？
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          人类的大脑在不确定的世界中做决策，大语言模型亦然。从生成下一个词的 Softmax 概率分布，到优化模型惊奇度的交叉熵损失，
          再到利用上下文提示词修正信念的贝叶斯推断——<strong>概率与信息论是大模型思维的灵魂</strong>。
        </p>

        {/* 人话故事卡片 (ELI5 模式特供) */}
        {isEli5Mode && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-3">
            <div className="font-bold flex items-center gap-1.5 text-sm text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>像给 5 岁小孩讲故事：概率与大模型的三大灵魂隐喻</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300 block">🕵️ 1. 名侦探破案 (贝叶斯)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  原本怀疑管家的概率是 80%，但在凶案现场找到了厨师的纽扣（新证据）！侦探立刻修正怀疑度。给 AI 输入一段 Prompt，就是给它提供关键证据来收窄答案！
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400 block">⚡ 2. 错得越狂妄，板子越狠 (交叉熵)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  如果你心虚猜错，只挨 1 下板子；但如果你拍胸脯 99.9% 担保答案是“猫”，结果真实答案是“狗”，交叉熵会降下<strong>成千上万倍的惩罚</strong>，狠狠打醒模型！
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">🎰 3. 大转盘与掷骰子 (Softmax与温度)</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  大模型不是活人，它每生成一个字就是转动一个大彩电转盘！温度低时赢家通吃转盘只有一块肉；温度高时转盘全被切碎，人人有份群魔乱舞。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 模块一：贝叶斯定理与条件概率 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-sm flex items-center justify-center font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">贝叶斯定理：用新证据动态刷新认知</h2>
            <p className="text-xs text-slate-400">从先验信念，到观察到特征后的后验更新</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          当大模型收到用户的一句输入（Prompt）时，本质上是接收到了世界的一个<strong>新证据 $E$</strong>。
          模型利用自注意力机制，在这个新证据的条件下计算下一个词的条件概率分布 $P(\text{'{Token}'} \mid \text{'{Context}'})$。
          理解贝叶斯思维，是理解大模型“为什么需要上下文”的钥匙。
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

      {/* 模块二：交叉熵损失与大模型生成大转盘 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-sm flex items-center justify-center font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">交叉熵与 Softmax：衡量模型惊奇度与轮盘赌</h2>
            <p className="text-xs text-slate-400">大语言模型预训练与自回归采样的终极核心机制</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          克劳德·香农在 1948 年提出了<strong>信息熵</strong>：用来量化一个概率分布的不确定性。
          如果模型对生成的词模棱两可（均匀分布），熵最大；如果模型笃定知道下一个词，熵接近 0。
          而在训练时，我们使用<strong>交叉熵损失（Cross-Entropy Loss）</strong>衡量模型预测概率分布与真实语料分布的差异！
        </p>

        <MathCard
          title="多分类交叉熵损失公式 (Cross-Entropy Loss)"
          formula="\mathcal{L}_{\text{CE}} = - \sum_{k=1}^K y_k \ln(\hat{y}_k) = - \ln(\hat{y}_{\text{target}})"
          plainTranslation="损失 = - ln(真实目标词的预测概率)"
          intuition="其中 y 是真实分布（One-hot 向量）；y_hat 是经 Softmax 归一化后的模型预测概率分布。"
          tags={['交叉熵', '信息熵', '负对数似然']}
        />

        {/* 极限直觉舱：大模型生成大转盘 */}
        <TokenRouletteLab />

        {/* 交互实验 2 */}
        <CrossEntropyLab />
      </section>

      {/* 模块三：高尔顿物理钉板机与正态分布 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-sm flex items-center justify-center font-bold">
            03
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">高斯正态分布的诞生：微随机事件的宏观汇聚</h2>
            <p className="text-xs text-slate-400">从一枚硬币的独立弹跳，见证钟形曲线的自然涌现</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          为什么高斯钟形曲线（正态分布）无处不在？从神经网络的权重初始化（Kaiming / Xavier）、
          扩散模型（Diffusion Models）的每一步加噪与去噪，再到 Transformer 内部特征的统计分布，
          数以万计微小的随机扰动叠加，最终都会呈现完美的正态分布。
        </p>

        {/* 极限直觉舱：高尔顿物理重力钉板机 */}
        <GaltonBoardPhysicsLab />

        {/* 交互实验 3 */}
        <BinomialToGaussianLab />
      </section>

      {/* 模块四：PyTorch 代码实战 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-sm flex items-center justify-center font-bold">
            04
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">工程落地：PyTorch 交叉熵与温度采样</h2>
            <p className="text-xs text-slate-400">探寻 ChatGPT 背后采样温度与交叉熵的实际代码实现</p>
          </div>
        </div>

        <CodeBlock
          filename="probability_cross_entropy_sampling.py"
          language="python"
          code={`import torch
import torch.nn as nn
import torch.nn.functional as F

# 1. 模型末端输出的未归一化分值 Logits (Batch=1, Vocab=4)
logits = torch.tensor([[3.2, 1.5, 0.4, -1.0]])
target = torch.tensor([0]) # 目标正确词的索引

# 2. 计算交叉熵损失 (内置融合了 LogSoftmax + NLLLoss，数值更稳定)
criterion = nn.CrossEntropyLoss()
loss = criterion(logits, target)
print(f"交叉熵损失 CE Loss: {loss.item():.4f}")

# 3. 探究温度采样 (Temperature Scaling)
temperature = 0.7
scaled_logits = logits / temperature
probs = F.softmax(scaled_logits, dim=-1)
print("Softmax 概率分布:", [round(p, 4) for p in probs[0].tolist()])

# 4. 根据多项式分布采样下一个生成的 Token
sampled_token_id = torch.multinomial(probs, num_samples=1)
print(f"本次采样的 Token ID: {sampled_token_id.item()}")`}
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

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold">FOUNDATION 03</span>
            <h3 className="text-lg font-bold text-white mt-1">进阶模块 03：统计学与数据分布</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索中心极限定理、12 层大模型数值爆炸灾难模拟器、语义向量罗盘。
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

      {/* 概率论闯关测验 */}
      <QuizModal
        chapterTitle="AI 数学基石：概率与信息论测验"
        questions={probQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
