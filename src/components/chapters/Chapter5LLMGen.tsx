import React from 'react';
import {
  Sparkles,
  Sliders,
  Flame,
  Filter,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { QUIZZES } from '../../data/quizzesData';
import { ActiveTab } from '../../types';

interface Chapter5Props {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const Chapter5LLMGen: React.FC<Chapter5Props> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const chapterQuizzes = QUIZZES.filter((q) => q.chapterId === 'chapter-5');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 章节头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            CHAPTER 05
          </span>
          <span className="text-xs text-slate-400">⏱️ 8 分钟实战收官</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          大语言模型生成实战：自回归与采样参数
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          模型训练完成后，它又是如何像真人一样流畅打字、滔滔不绝地回答人类问题的？为什么同样的提示词每次回答都不一样？本章为你揭晓自回归生成循环的秘密，以及操纵模型创造力与胡说八道的三大神级参数！
        </p>
      </div>

      {/* 第一节：自回归生成循环 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            1
          </span>
          自回归生成 (Autoregressive)：超级文字接龙
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          所有的 GPT 系列大模型，在生成回答时都遵守极其严格的<strong>“单向接龙法则”</strong>：它无法一次性把整篇文章直接印出来，而必须一个词一个词地推算。
        </p>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
          <div className="font-bold text-indigo-400 flex items-center gap-2 font-sans text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>自回归单步推断循环分解：</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold">第 1 步：读入上下文</span>
              <p className="text-slate-400 font-sans text-[11px]">
                输入当前已有文本序列：例如 <code>["今天", "天气"]</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold">第 2 步：预测词表分值</span>
              <p className="text-slate-400 font-sans text-[11px]">
                计算 5 万个词的 Logits，对最后一个位置执行 Softmax。
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold">第 3 步：采样挑选 1 词</span>
              <p className="text-slate-400 font-sans text-[11px]">
                根据温度与采样策略挑选出得分最高的词（如 <code>"真"</code>）。
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold">第 4 步：拼接重入循环</span>
              <p className="text-slate-400 font-sans text-[11px]">
                变为 <code>["今天", "天气", "真"]</code>，开始推断下一个字！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第二节：采样三大神参数 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            2
          </span>
          三大生成采样超参数：掌控 AI 的理性与狂想
        </h2>

        {/* 1. 温度 Temperature */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-orange-400 flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4" />
              1. 温度系数 (Temperature): z_i / T
            </span>
            <span className="text-xs font-mono text-slate-400">控制概率分布的平坦度</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            • <strong>低温模式 (T → 0.1 或贪心 Greedy)</strong>：分母很小，微小的分数差异被极度放大。第一名概率飙升到 99%，模型表现极其严谨、可预测、重复，适合写代码或做严谨数学题。<br />
            • <strong>常温模式 (T ≈ 0.7 ~ 1.0)</strong>：既保持逻辑连贯，又兼具多样的用词和灵活性，适合日常对话与文案创作。<br />
            • <strong>高温模式 (T &gt; 1.5)</strong>：所有候选词的概率被熨烫得非常平坦，低频冷门词也有机会被选中。模型天马行空，但也极易发生幻觉或胡言乱语。
          </p>
        </div>

        {/* 2. Top-K 截断 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-400 flex items-center gap-1.5 text-sm">
              <Filter className="w-4 h-4" />
              2. Top-K 截断过滤 (Top-K Sampling)
            </span>
            <span className="text-xs font-mono text-slate-400">只保留概率最高的前 K 个词</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            无论词表有多少词，强制只在概率排名前 $K$（如 $K=50$）的候选词中重新归一化并挑选。第 $K+1$ 名以后的所有词全部被一刀切成 0%，从源头上防止模型挑出荒唐词汇。
          </p>
        </div>

        {/* 3. Top-p 核采样 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" />
              3. Top-p 核采样 (Nucleus Sampling)
            </span>
            <span className="text-xs font-mono text-slate-400">动态自适应累积概率截断</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Top-K 过于僵硬。而 Top-p 将候选词按概率从大到小排列，<strong>累加概率刚好达到 p（如 0.9）的最小集合</strong>作为候选池。下一个词极度确定时候选池自动缩小到 1 个；下一个词有多种合理选择时候选池自动扩大，优雅自然！
          </p>
        </div>
      </section>

      {/* 第三节：大模型训练三部曲全景 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            3
          </span>
          现代大模型驯化全景：从“字面接龙”到“贴心助手”
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-300">阶段 1：无监督预训练</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              阅读上万亿个网页文本，死磕“下一个词预测”。此时模型博览群书，具有了惊人的语言模式理解，但还不懂如何跟人类礼貌对话。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-300">阶段 2：SFT 指令微调</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              使用由人类专家撰写的数十万条“提示词 - 标准回答”高质量对话对，教会模型理解什么是“问答”、“总结”、“写诗”，学会按指令办事。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-300">阶段 3：RLHF 人类对齐</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              引入奖励模型 (Reward Model) 或 DPO 直接偏好优化，使模型生成更加有用 (Helpful)、真诚 (Honest)、无害 (Harmless) 的回答。
            </p>
          </div>
        </div>
      </section>

      {/* 跳转到生成沙盒 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-purple-900/30 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base">想要亲手调动 Temperature 和 Top-p？</h3>
          <p className="text-xs text-slate-300 mt-1">
            进入微型大模型生成实验室，单步单词执行自回归接龙，拖动滑块实时查看候选词概率条的动态截断！
          </p>
        </div>
        <button
          onClick={() => setActiveTab('playground-llm')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
        >
          <span>进入微型大模型生成实验室</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 本章测验 */}
      <QuizModal
        chapterTitle="第 5 章：大模型生成实战与采样"
        questions={chapterQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
