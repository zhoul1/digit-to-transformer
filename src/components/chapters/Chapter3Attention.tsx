import React from 'react';
import {
  Eye,
  Network,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { QUIZZES } from '../../data/quizzesData';
import { ActiveTab } from '../../types';

interface Chapter3Props {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const Chapter3Attention: React.FC<Chapter3Props> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const chapterQuizzes = QUIZZES.filter((q) => q.chapterId === 'chapter-3');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 章节头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            CHAPTER 03
          </span>
          <span className="text-xs text-slate-400">⏱️ 10 分钟深度沉浸</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          注意力机制革命：Self-Attention 与多头注意力
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          2017 年，Google 团队发表了划时代的论文《Attention Is All You Need》。从此，统治自然语言几十年的循环神经网络（RNN）轰然倒塌，现代大模型时代正式拉开序幕。本章带你用图书借阅的直觉，彻底攻克 Q、K、V 与注意力矩阵运算！
        </p>
      </div>

      {/* 第一节：RNN 为什么必须被淘汰 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            1
          </span>
          RNN 的致命死穴：串行瓶颈与遗忘症
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          在 Transformer 诞生之前，业界处理序列主要靠 RNN（循环神经网络）。RNN 像一个排队传话筒：读完第一个词，把记忆传给第二个词；读完第二个，再传给第三个……
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              ❌ RNN 无法在现代 GPU 上并行训练
            </span>
            <p className="text-slate-400 leading-relaxed">
              必须算完第 1 个词才能算第 2 个，必须算完第 99 个才能算第 100 个！几万块先进 GPU 算力无法同时启动，训练百亿模型需要几百年。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              ✅ Transformer 完美矩阵并行计算
            </span>
            <p className="text-slate-400 leading-relaxed">
              一个矩阵乘法，整句话所有词与所有词之间的关系在同一时刻一瞬间全部算完！直接将 GPU 的超强张量核吃满。
            </p>
          </div>
        </div>
      </section>

      {/* 第二节：图书馆借书隐喻与 Q, K, V */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            2
          </span>
          图书馆借书隐喻：彻底搞懂 Q (Query), K (Key), V (Value)
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          很多人看到论文里的 $Q, K, V$ 就头大。其实它跟你在图书馆找书的体验完全一模一样：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-base">Query (Q)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">
                读者需求
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              这是读者走进图书馆手里攥着的<strong>借书需求单</strong>。例如：“我想查乔布斯创办的那家科技公司的产品评测”。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-base">Key (K)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                书脊标签
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              这是书架上每本书书脊上的<strong>分类索引标签</strong>。例如：《红富士水果种植》、《消费级电子产品》、《牛顿经典力学》。
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-base">Value (V)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                书内正文
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              这是书本里密密麻麻的<strong>真实正文知识</strong>。匹配度越高的书，我们读它（提取它知识）的比例就越大！
            </p>
          </div>
        </div>
      </section>

      {/* 第三节：自注意力核心公式五步拆解 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            3
          </span>
          自注意力数学公式五步走
        </h2>

        <MathCard
          title="经典缩放点积自注意力公式 (Scaled Dot-Product Attention)"
          formula="Attention(Q, K, V) = Softmax( (Q · Kᵀ) / √d_k + Mask ) · V"
          plainTranslation="拿每一个词的查询 Q 去跟全句所有词的键 K 做点积打分；除以根号特征维度防止梯度爆炸；加上因果掩码防止偷看；用 Softmax 算出分配权重的百分比；最后把各词的内容 V 按百分比混合打包输出！"
          intuition="每个词原本只懂自己的字面意思。经过这一套运算后，它吸收了与它最相关的前文内容，获得了语境生命！"
          tags={['点积相似度', '因果掩码', 'Softmax 加权']}
        />

        {/* 逐步拆解说明卡片 */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <strong className="text-indigo-400">第一步：点积打分 (Q · Kᵀ)</strong>
            <p className="text-slate-300">
              两个向量方向越一致，点积数值越大。这相当于衡量两词在语法或逻辑上的匹配程度。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <strong className="text-indigo-400">第二步：缩放除以 √d_k</strong>
            <p className="text-slate-300">
              当特征维度很长（比如 128 或 1024）时，点积数值可能飙升到几百。一旦输入极大，Softmax 函数两端的导数几乎为 0（梯度消失）。除以 √d_k 能将方差稳定在 1.0 附近。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <strong className="text-indigo-400">第三步：因果掩码 (Causal Mask)</strong>
            <p className="text-slate-300">
              考试时不能偷看后面的参考答案！生成模型在预测第 3 个词时，绝不能看到第 4 个词。因果掩码将矩阵右上角填为 -∞，Softmax 之后对应位置的注意力就是绝对的 0%。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <strong className="text-indigo-400">第四步：加权混合 (AttentionWeights · V)</strong>
            <p className="text-slate-300">
              Softmax 输出了一组总和为 100% 的权重。例如：“它”这个词把 85% 的注意力分给前文的“小狗”，15% 给“骨头”，最终合成出的新向量就深刻融入了“小狗”的实体特征！
            </p>
          </div>
        </div>
      </section>

      {/* 第四节：多头注意力 (Multi-Head Attention) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            4
          </span>
          多头注意力：多重视角看世界
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          如果只有一个注意力头，模型可能只能专注于一种关系（比如最近的词）。为了让模型同时捕捉句子的多种维度，Transformer 采用了<strong>多头注意力 (Multi-Head Attention)</strong>：
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
            <span className="font-bold text-purple-300">头 1：语法搭配头</span>
            <p className="text-slate-400">专注于“动词与宾语”、“介词与名词”的紧密语法连接。</p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
            <span className="font-bold text-blue-300">头 2：指代消歧头</span>
            <p className="text-slate-400">专注于把代词（“他”、“它”）与前方提到的真实主体绑定。</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
            <span className="font-bold text-emerald-300">头 3：远距因果头</span>
            <p className="text-slate-400">跨越几十个词，连接句首的“虽然……”与句末的“但是……”。</p>
          </div>
        </div>
      </section>

      {/* 跳转实验室 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">想要亲手调动热力图矩阵？</h3>
          <p className="text-xs text-slate-300 mt-1">
            进入自注意力演算实验室，查看词与词点积、切换因果掩码，以及观察不同 Head 之间的视角差异！
          </p>
        </div>
        <button
          onClick={() => setActiveTab('playground-attention')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
        >
          <span>进入自注意力演算实验室</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 本章测验 */}
      <QuizModal
        chapterTitle="第 3 章：自注意力与多头机制"
        questions={chapterQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
