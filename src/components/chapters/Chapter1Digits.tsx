import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { QUIZZES } from '../../data/quizzesData';
import { softmax } from '../../utils/attentionMath';
import { ActiveTab } from '../../types';

interface Chapter1Props {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const Chapter1Digits: React.FC<Chapter1Props> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const chapterQuizzes = QUIZZES.filter((q) => q.chapterId === 'chapter-1');

  // 交互微实验：手动调节 3 个 Logits 观察 Softmax 变化
  const [testLogits, setTestLogits] = useState<number[]>([2.0, 1.0, 0.1]);
  const testProbs = softmax(testLogits);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 章节头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            CHAPTER 01
          </span>
          <span className="text-xs text-slate-400">⏱️ 8 分钟沉浸阅读</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          像素与神经元：手写数字是如何被识别的？
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          手写数字识别（MNIST）是所有现代深度学习的摇篮。搞懂了计算机如何把一张 28 × 28 的黑白画格认成数字 3，你就已经掌握了大语言模型 70% 的底层数学基石！
        </p>
      </div>

      {/* 第一节：计算机如何“看见”图像 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            1
          </span>
          计算机的眼睛：28×28 的灰阶方格阵
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          当你用手指在屏幕上画一个数字时，人类看到的是流畅的弧线。但计算机的底层只有数字。它把整个屏幕划分为 <strong className="text-indigo-400">28 行 × 28 列</strong> 的微型格子（共 784 个方块）。
        </p>

        {/* 视觉示意图：网格展开成一维向量 */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-mono">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-24 h-24 rounded-xl bg-slate-950 border-2 border-indigo-500/40 grid grid-cols-4 gap-0.5 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[2px] ${
                      [5, 6, 9, 10, 13].includes(i) ? 'bg-indigo-400' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-400 font-semibold">28 × 28 二维网格</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-indigo-400">
              <ArrowRight className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] uppercase font-bold">Flatten (展平)</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 px-4 rounded-xl bg-slate-950 border-2 border-indigo-500/40 flex items-center gap-1">
                {[0.0, 0.0, 0.9, 0.8, 0.1, '...', 0.0].map((v, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300"
                  >
                    {String(v)}
                  </span>
                ))}
              </div>
              <span className="text-slate-400 font-semibold">长度 784 的一维向量 x</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-md">
            每一个像素点只有明暗：纯黑是 0.0，纯白是 1.0。将 784 个数值排成一排，这就是输入给神经网络的原始数据向量。
          </p>
        </div>
      </section>

      {/* 第二节：神经元在干什么 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            2
          </span>
          神经元不是神秘生物：它是一个“笔画模板过滤器”
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          一个神经元本质上就是一份<strong>“评分问卷”</strong>：每个神经元自带 784 个专属权重 $W = [w_1, w_2, \dots, w_{784}]$ 和一个偏置 $b$。
        </p>

        <MathCard
          title="核心线性公式：神经元加权求和"
          formula="z = W · x + b = ∑ (w_i · x_i) + b"
          plainTranslation="把图片上每个格子的明暗度，乘以对应的权重加起来，再加上一个基础偏置。如果匹配你负责的特征，得分就奇高；如果不匹配，得分就低甚至为负数。"
          intuition="某个神经元可能专门负责检测‘中间有没有横杠’。只要你在中间画了横杠，那几个格子的 x_i 是 1，对应的 w_i 也是正大数，乘积相加后得分 z 就会爆发！"
          tags={['矩阵乘法', '线性投影', '特征检测']}
        />

        <MathCard
          title="非线性激活函数：ReLU (Rectified Linear Unit)"
          formula="a = ReLU(z) = max(0, z)"
          plainTranslation="如果算出来的得分大于 0，原样通过；如果小于 0，统统归零（切断电流）！"
          intuition="为什么必须有这步？因为如果没有非线性，无论网络叠多少层，线性变换的复合依然是线性变换，模型根本画不出弯曲复杂的分类边界！ReLU 就像一道单向开关阀门。"
          tags={['非线性', '空间扭曲', '稀疏激活']}
        />
      </section>

      {/* 第三节：Softmax 怎么把得分变概率 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            3
          </span>
          Softmax 归一化：将原始分值变成概率百分比
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          经过多层网络计算后，最终输出层会得到 10 个原始得分（比如：数字 0 得 1.2 分，数字 3 得 6.8 分，数字 8 得 4.1 分）。这些任意正负的分值被称为 <strong>Logits</strong>。如何把它们变成总和刚好 100% 的预测概率？靠的就是 <strong>Softmax</strong>！
        </p>

        <MathCard
          title="Softmax 归一化公式"
          formula="p_i = e^{z_i} / ∑ (e^{z_j})"
          plainTranslation="第一步：把每个得分取自然底数指数 e^z（即使是负分，也变成了正数，而且高分被指数级拉大）；第二步：除以所有分数的指数总和，强制使得所有类别的概率加起来刚好等于 1.0 (100%)！"
          intuition="Softmax 是分类问题的终极裁判。在大语言模型中，词表有 50,000 个词，大模型同样是用 Softmax 算出这 50,000 个词各自成为下一个词的概率！"
          tags={['概率分布', '多分类', '大模型共通']}
        />

        {/* 交互微实验：实时滑动体验 Softmax */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Sliders className="w-4 h-4" />
            <span>动手实验：手动调节 3 个类别的原始得分 Logits，看 Softmax 概率动态变化：</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testLogits.map((val, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">类别 {idx} (得分 Logit):</span>
                  <span className="font-bold text-indigo-400">{val.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="6"
                  step="0.2"
                  value={val}
                  onChange={(e) => {
                    const copy = [...testLogits];
                    copy[idx] = parseFloat(e.target.value);
                    setTestLogits(copy);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono">
                  <span className="text-slate-500">Softmax 概率:</span>
                  <strong className="text-emerald-400 text-sm">
                    {(testProbs[idx] * 100).toFixed(1)}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 第四节：PyTorch 对应实现 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            4
          </span>
          实战对照：PyTorch 核心代码只需 15 行
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          理论听懂了，工程代码怎么写？在现代 PyTorch 中，定义一个全连接手写数字识别器极其纯粹：
        </p>

        <CodeBlock
          filename="mnist_mlp_core.py"
          language="python"
          code={`import torch.nn as nn

class SimpleDigitMLP(nn.Module):
    def __init__(self):
        super().__init__()
        # 784 个像素点 -> 128 个特征神经元
        self.fc1 = nn.Linear(784, 128)
        self.relu = nn.ReLU()
        # 128 个特征 -> 10 个数字分类得分 (Logits)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        # 展平为 [batch_size, 784]
        x = x.view(x.size(0), -1)
        # 第一层加权与非线性
        h = self.relu(self.fc1(x))
        # 第二层输出 10 个类别的未归一化分值
        logits = self.fc2(h)
        return logits
`}
        />
      </section>

      {/* 练习与画板实操呼出 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">想要亲眼看看神经元是如何被点亮的？</h3>
          <p className="text-xs text-slate-300 mt-1">
            打开“手写数字画板”，用鼠标自由绘制任意数字，实时观察隐藏层激活与 Softmax 概率条！
          </p>
        </div>
        <button
          onClick={() => setActiveTab('playground-digit')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
        >
          <span>进入手写数字画板</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 本章闯关测验 */}
      <QuizModal
        chapterTitle="第 1 章：像素与神经元"
        questions={chapterQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
