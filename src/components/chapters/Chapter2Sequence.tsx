import React, { useState } from 'react';
import {
  Shuffle,
  Sparkles,
  ArrowRight,
  Split,
  Binary,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { QUIZZES } from '../../data/quizzesData';
import { ActiveTab } from '../../types';

interface Chapter2Props {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const Chapter2Sequence: React.FC<Chapter2Props> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const chapterQuizzes = QUIZZES.filter((q) => q.chapterId === 'chapter-2');

  // 词向量空间交互示例：选择不同的词对看几何相似度
  const WORD_VECTORS: { [word: string]: [number, number] } = {
    '国王': [0.8, 0.9],
    '女王': [0.75, 0.85],
    '男人': [0.85, 0.2],
    '女人': [0.8, 0.15],
    '苹果 (水果)': [-0.7, 0.6],
    '香蕉 (水果)': [-0.8, 0.5],
    '手机 (科技)': [-0.2, -0.8],
    '电脑 (科技)': [-0.1, -0.9],
  };

  const [selectedWord1, setSelectedWord1] = useState<string>('国王');
  const [selectedWord2, setSelectedWord2] = useState<string>('女王');

  const v1 = WORD_VECTORS[selectedWord1];
  const v2 = WORD_VECTORS[selectedWord2];
  // 计算余弦相似度
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  const cosineSim = dot / (mag1 * mag2);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 章节头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            CHAPTER 02
          </span>
          <span className="text-xs text-slate-400">⏱️ 7 分钟沉浸阅读</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          惊天跨越：从二维网格到一维序列与 Token
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          既然我们已经能用神经网络认出数字，那为什么不能直接拿它来写小说、聊大天？本章带你理解人类语言的本质特点、Token 分词与词嵌入（Embedding）的几何魔法，以及两者在底层数学上的终极统一。
        </p>
      </div>

      {/* 第一节：为什么图像网络无法直接处理文字 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            1
          </span>
          从“静态方块”到“流动长河”
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          上一章的数字识别非常省心：每张图片永远被裁切成 28 × 28 个格子，输入永远是固定的 784 个数字。
          但人类的语言完全不同：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-indigo-400">1. 长度动态不确定</span>
            <p className="text-slate-400">
              一句话可以只有 2 个字（“你好”），也可以长达 5000 字的一篇论文。固定输入的 MLP 瞬间失效。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-400">2. 顺序颠倒意义剧变</span>
            <p className="text-slate-400">
              “猫咬狗”和“狗咬猫”，用词完全一样，顺序一变故事全变。模型必须具备强烈的时序与位置感知。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400">3. 超长距离的上下文呼应</span>
            <p className="text-slate-400">
              第一段埋下的伏笔，可能在第十章才揭晓答案。传统 RNN 读着读着就忘记了前面的内容（梯度消失）。
            </p>
          </div>
        </div>
      </section>

      {/* 第二节：Token 与词表 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            2
          </span>
          什么是 Token？计算机认字的“身份证号”
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          计算机不懂什么是“爱”或“科学”。在进入模型前，所有文字都会被切成一块块的词元（<strong>Token</strong>），并按照词表（Vocabulary）分配一个唯一的数字编号。
        </p>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center gap-3">
          <div className="text-xs text-slate-400 font-semibold">分词与编码示例：</div>
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
              "我" (ID: 1042)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
              "喜欢" (ID: 8521)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
              "大" (ID: 301)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
              "模型" (ID: 9402)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            现代大模型（如 GPT-4, DeepSeek）的词表大小通常在 50,000 ~ 128,000 之间，涵盖汉字、英文单词、标点乃至代码片段。
          </p>
        </div>
      </section>

      {/* 第三节：词嵌入 (Embedding) 的几何奇迹 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            3
          </span>
          词嵌入 (Embedding)：给离散文字赋予几何空间
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          如果我们直接用纯数字 ID（如“苹果”=34，“香蕉”=35，“手机”=9821），数字大小没有任何几何含义。
          于是，科学家发明了<strong>词嵌入 (Embedding)</strong>：将每个词映射到一个几百甚至上千维的连续向量空间中！
        </p>

        <MathCard
          title="词嵌入查找：查表投影"
          formula="x_t = EmbeddingMatrix[token_id] ∈ ℝ^{d_model}"
          plainTranslation="每个 Token ID 就是查字典的页码，一查就能拿到一排（例如 768 个）浮点数，代表这个词在虚拟语义世界里的精确 GPS 坐标！"
          intuition="在语义空间中，意思相近的词距离极近；而且向量之间可以像加减乘除一样运算：‘国王 - 男人 + 女人 ≈ 女王’！"
          tags={['稠密向量', '语义空间', '余弦相似度']}
        />

        {/* 交互实验：词向量相似度测量 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Compass className="w-4 h-4" />
            <span>动手实验：挑选两个词，看看它们在语义向量空间中的余弦相似度：</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">词汇 A:</span>
              <select
                value={selectedWord1}
                onChange={(e) => setSelectedWord1(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer"
              >
                {Object.keys(WORD_VECTORS).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">词汇 B:</span>
              <select
                value={selectedWord2}
                onChange={(e) => setSelectedWord2(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer"
              >
                {Object.keys(WORD_VECTORS).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 测量结果 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              向量余弦相似度 (Cosine Similarity):{' '}
              <strong className="text-indigo-400 font-mono text-base ml-2">
                {cosineSim.toFixed(3)}
              </strong>
            </div>
            <div className="text-xs">
              {cosineSim > 0.8 ? (
                <span className="text-emerald-400 font-bold">🎉 语义高度相近！</span>
              ) : cosineSim > 0.3 ? (
                <span className="text-amber-400 font-medium">中等相关</span>
              ) : (
                <span className="text-slate-500">语义迥异 / 无关</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 第四节：核心思维统一 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            4
          </span>
          核心思维大统揽：从数字分类到下一个词预测
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          很多人以为大模型深不可测，但当你把手写识别和 LLM 摆在同一张数学手术台上时，你会发现它们**共享着完全相同的骨架**：
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="p-3.5">对比维度</th>
                <th className="p-3.5 text-indigo-400">手写数字识别 (MNIST)</th>
                <th className="p-3.5 text-purple-400">大语言模型 (LLM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-xs">
              <tr>
                <td className="p-3.5 text-slate-400 font-sans">输入内容</td>
                <td className="p-3.5">784 个像素灰阶数值</td>
                <td className="p-3.5">前文 T 个 Token 的嵌入向量</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-400 font-sans">特征提取层</td>
                <td className="p-3.5">全连接线性层 + ReLU</td>
                <td className="p-3.5">自注意力层 + FFN</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-400 font-sans">候选类别数</td>
                <td className="p-3.5 font-bold text-indigo-300">10 种 (数字 0 ~ 9)</td>
                <td className="p-3.5 font-bold text-purple-300">约 50,000 种 (全词表)</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-400 font-sans">最终输出算法</td>
                <td className="p-3.5">Softmax 归一化概率分布</td>
                <td className="p-3.5">Softmax 归一化概率分布</td>
              </tr>
              <tr>
                <td className="p-3.5 text-slate-400 font-sans">决策目标</td>
                <td className="p-3.5">挑出概率最大的单一数字</td>
                <td className="p-3.5">根据概率挑选下一个词，循环接龙</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 本章闯关测验 */}
      <QuizModal
        chapterTitle="第 2 章：从图像网格到序列 Token"
        questions={chapterQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
