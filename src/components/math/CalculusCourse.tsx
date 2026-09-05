import React from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Layers, Compass, Lightbulb } from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { DerivativeExplorer } from './calculus/DerivativeExplorer';
import { GradientDescentLab } from './calculus/GradientDescentLab';
import { ChainRuleVisualizer } from './calculus/ChainRuleVisualizer';
import { MATH_QUIZZES } from '../../data/mathQuizzesData';
import { ActiveTab } from '../../types';

interface CalculusCourseProps {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const CalculusCourse: React.FC<CalculusCourseProps> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const calculusQuizzes = MATH_QUIZZES.filter((q) => q.chapterId === 'math-calculus');

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* 课程大头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-blue-950/50 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            MATH FOUNDATION 01
          </span>
          <span className="text-xs text-slate-400">⚡ 沉浸式数学直觉 · 动态可视化实操</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          微积分：神经网络如何学会“自我修正”？
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          人工智能没有神秘的魔法。一个拥有上千亿参数的大语言模型，之所以能从胡言乱语学会作诗、写代码，底层完全是由
          <strong>微积分的导数、梯度下降与链式法则</strong> 驱动参数一步步向零误差收敛。
        </p>
      </div>

      {/* 模块一：导数与瞬时变化率 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-sm flex items-center justify-center font-bold">
            01
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">导数：探索极小处的瞬时倾斜度</h2>
            <p className="text-xs text-slate-400">从割线的极限到切线的斜率，感知函数变化的敏锐度</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          在初等代数中，斜率是直线倾斜程度的度量：Δy / Δx。但在复杂的曲线上，每个点的倾斜度时刻在变。
          微积分创始人牛顿与莱布尼茨给出的天才洞见是：<strong>让割线的两点无限逼近（Δx → 0），割线的极限就是该点的切线斜率，这就是导数！</strong>
        </p>

        <MathCard
          title="导数的严格数学定义"
          formula="f'(x) = \lim_{\Delta x \to 0} \frac{f(x + \Delta x) - f(x)}{\Delta x} = \frac{df}{dx}"
          plainTranslation="当两点距离趋于无限小时，函数瞬时变化的斜率极限值。"
          intuition="导数的符号告诉我们前进方向：导数大于 0 说明向右走函数值升高；导数小于 0 说明向右走降低；导数等于 0 则是波峰或谷底极值点！"
          tags={['导数', '极限', '切线斜率']}
        />

        {/* 交互实验 1 */}
        <DerivativeExplorer />
      </section>

      {/* 模块二：梯度下降与参数优化 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            02
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">梯度下降：迷雾大山中的盲人下山法则</h2>
            <p className="text-xs text-slate-400">将导数推广到多维向量空间，AI 模型参数迭代的万物之源</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          如果模型只有一个权重 $w$，我们用一阶导数 $f'(w)$；如果有成百上千亿个权重，我们将对每个权重的偏导数打包成一个向量，
          这就是<strong>梯度向量（$\nabla L$）</strong>。梯度向量在几何上指向<strong>曲面坡度最陡峭的上升方向</strong>。
          因此，只要沿着<strong>负梯度方向（$-\nabla L$）</strong>挪动参数，就能让损失稳步下降！
        </p>

        <MathCard
          title="梯度更新公式 (Gradient Descent Update Rule)"
          formula="w^{(t+1)} = w^{(t)} - \eta \cdot \nabla_w L(w^{(t)})"
          plainTranslation="下一时刻的权重 = 当前权重 - 步长 × 当前梯度方向"
          intuition="其中 η (Eta) 是学习率。学习率太小挪动极慢；学习率太大则像穿了弹簧鞋直接飞出山谷（梯度爆炸 NaN）！"
          tags={['梯度下降', '学习率', '优化器']}
        />

        {/* 交互实验 2 */}
        <GradientDescentLab />
      </section>

      {/* 模块三：链式法则与反向传播 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-sm flex items-center justify-center font-bold">
            03
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">链式法则：穿透深层网络的逆向多米诺骨牌</h2>
            <p className="text-xs text-slate-400">为何 100 层的 Transformer 能够精准指导第 1 层的权重更新？</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          现代神经网络往往由数十甚至上百层复合而成：L = Loss(f_k(... f_1(x)))。
          如果逐层展开硬求导，公式复杂度会发生组合爆炸。但微积分的<strong>链式法则（Chain Rule）</strong>指出：
          <strong>复合函数的总导数等于各局部导数的连乘！</strong>
          这使得计算机只需从末端的损失值开始，把相邻环节的局部导数像接力棒一样相乘倒传回去，便能以 $O(N)$ 的高效代价算出所有参数的梯度。这就是轰动 AI 界的<strong>反向传播算法（Backpropagation）</strong>！
        </p>

        {/* 交互实验 3 */}
        <ChainRuleVisualizer />
      </section>

      {/* 模块四：PyTorch 自动微分代码对照 */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-sm flex items-center justify-center font-bold">
            04
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">工程落地：PyTorch Autograd 极简代码</h2>
            <p className="text-xs text-slate-400">看看在真实工业代码中，微积分是如何被优雅调用的</p>
          </div>
        </div>

        <CodeBlock
          filename="calculus_autograd_demo.py"
          language="python"
          code={`import torch

# 1. 声明需要求梯度的权重参数 (requires_grad=True)
w = torch.tensor([2.0], requires_grad=True)
x = torch.tensor([3.0])
target = torch.tensor([10.0])

# 2. 前向传播：建立动态计算图
z = w * x                    # z = 6.0
pred = torch.sigmoid(z)      # pred = 0.9975
loss = 0.5 * (pred - target) ** 2

print(f"当前损失 Loss: {loss.item():.4f}")

# 3. 反向传播：PyTorch 自动沿计算图执行链式法则！
loss.backward()

# 4. 查看计算出的梯度 ∂Loss/∂w
print(f"权重梯度 w.grad: {w.grad.item():.6f}")

# 5. 梯度下降单步更新
lr = 0.1
with torch.no_grad():
    w -= lr * w.grad         # 沿负梯度方向修正权重
    w.grad.zero_()           # 清空历史梯度缓存

print(f"更新后的新权重 w: {w.item():.4f}")`}
        />
      </section>

      {/* 课程联动导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold">NEXT FOUNDATION</span>
            <h3 className="text-lg font-bold text-white mt-1">进阶模块 02：概率论与信息熵</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              大模型输出的不是死板的答案，而是概率分布！探索贝叶斯定理、交叉熵损失与信息论直觉。
            </p>
          </div>
          <button
            onClick={() => setActiveTab('math-probability')}
            className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <span>进入概率论与信息论课程</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold">NEXT FOUNDATION</span>
            <h3 className="text-lg font-bold text-white mt-1">进阶模块 03：统计学与数据分布</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              探索中心极限定理、LayerNorm 归一化统计量（均值与方差），以及高维嵌入向量的相关性。
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

      {/* 微积分闯关测验 */}
      <QuizModal
        chapterTitle="AI 数学基石：微积分核心测验"
        questions={calculusQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
