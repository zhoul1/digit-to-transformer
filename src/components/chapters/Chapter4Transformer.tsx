import React from 'react';
import {
  Layers,
  Sparkles,
  GitCommit,
  Cpu,
  ArrowRight,
  TrendingUp,
  Workflow,
  CheckCircle,
} from 'lucide-react';
import { MathCard } from '../common/MathCard';
import { CodeBlock } from '../common/CodeBlock';
import { QuizModal } from '../common/QuizModal';
import { PositionalEncodingVisualizer } from '../common/PositionalEncodingVisualizer';
import { QUIZZES } from '../../data/quizzesData';
import { ActiveTab } from '../../types';

interface Chapter4Props {
  setActiveTab: (tab: ActiveTab) => void;
  onCompleteQuiz: () => void;
}

export const Chapter4Transformer: React.FC<Chapter4Props> = ({
  setActiveTab,
  onCompleteQuiz,
}) => {
  const chapterQuizzes = QUIZZES.filter((q) => q.chapterId === 'chapter-4');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 章节头部 */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            CHAPTER 04
          </span>
          <span className="text-xs text-slate-400">⏱️ 9 分钟架构全景</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          组装变形金刚：Transformer 完整架构拆解
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          有了自注意力机制（Self-Attention）这台强劲的心脏，我们还需要哪些零件才能拼出一辆能自主思考的现代大模型（如 GPT、Llama、DeepSeek）？本章为你逐一安装位置编码、残差连接、层归一化与前馈网络！
        </p>
      </div>

      {/* 第一节：位置编码 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            1
          </span>
          位置编码 (Positional Encoding)：让注意力看清先后次序
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          自注意力机制有一个天生的软肋：<strong>置换不变性 (Permutation Invariance)</strong>。
          如果你把“我吃苹果”打乱成“苹果吃我”，在不加额外信息的情况下，自注意力算出的两两点积和一模一样！
        </p>

        <MathCard
          title="经典正弦与余弦位置编码 (Sinusoidal Positional Encoding)"
          formula="PE(pos, 2i) = sin(pos / 10000^{2i/d}), PE(pos, 2i+1) = cos(pos / 10000^{2i/d})"
          plainTranslation="利用不同频率的正弦波和余弦波为每个坐标刻画唯一的时钟指纹。每个位置 pos 的波长不同，直接加进词嵌入向量中：x = TokenEmbedding + PosEmbedding！"
          intuition="就像在每个词的衣服口袋里塞了一张带有时间戳的纸条，注意力机制在比对内容的同时，能一眼看出谁在前、谁在后。"
          tags={['时序信息', '三角函数', 'RoPE 旋转位置编码前身']}
        />

        {/* 正弦余弦位置编码动态交互波形探索器 */}
        <PositionalEncodingVisualizer />
      </section>

      {/* 第二节：残差连接与层归一化 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            2
          </span>
          残差连接与层归一化：千亿模型不崩溃的高速公路
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          现代大模型动辄有 32 层、64 层甚至 100 多层 Transformer 块堆叠。如果没有特殊设计，反向传播的梯度在穿过数十层矩阵后会指数级衰减，深层网络根本学不动。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
              <GitCommit className="w-4 h-4" />
              残差连接 (Residual Connection: x + F(x))
            </span>
            <p className="text-slate-300 leading-relaxed">
              何恺明提出的残差思想：每一层算出的新特征不直接替代原始输入，而是<strong>以增量形式加在原输入上</strong>。求导时多出了一个常数项 $1$，为反向传播提供了畅通无阻的“梯度直通高铁”！
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="font-bold text-purple-400 flex items-center gap-1.5 text-sm">
              <TrendingUp className="w-4 h-4" />
              层归一化 (LayerNorm)
            </span>
            <p className="text-slate-300 leading-relaxed">
              让每个 Token 自己的特征向量均值保持在 0、方差保持在 1。无论网络多深，数值始终处在温和的合理区间，防止数值溢出或下溢。
            </p>
          </div>
        </div>
      </section>

      {/* 第三节：前馈神经网络 (FFN) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            3
          </span>
          前馈网络 (FFN)：注意力负责沟通，FFN 负责记住世界
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          在每个自注意力层之后，都会紧跟一个两层的全连接前馈网络（FFN）：
        </p>

        <MathCard
          title="前馈网络 FFN 结构"
          formula="FFN(x) = GELU(x · W_1 + b_1) · W_2 + b_2"
          plainTranslation="先把维度放大 4 倍（如从 4096 放大到 16384），经过平滑的 GELU 非线性激活函数弯曲变换，再压缩回原始维度。"
          intuition="前沿机理研究表明：自注意力更像是一个‘路由器’，负责在不同的 Token 之间传递信息；而 FFN 像一个巨大的‘常识记忆库’，储存着海量的事实知识（如‘法国的首都是巴黎’）！"
          tags={['知识记忆', '升维投影', 'GELU 激活']}
        />
      </section>

      {/* 第四节：现代 Decoder-Only GPT 架构全景图 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-sm flex items-center justify-center font-bold">
            4
          </span>
          完整组装！现代主流大模型 (GPT / Llama) 数据全流向
        </h2>

        {/* 动态流程图卡片 */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 font-mono text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Workflow className="w-4 h-4" />
            <span>Decoder-Only 单向生成流水线</span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>1. 原始提示词 Tokens: ["人工智能", "改变"]</span>
              <span className="text-indigo-400">[batch, seq_len]</span>
            </div>

            <div className="text-center text-slate-600">↓ 词嵌入查表 + 位置编码相加</div>

            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-indigo-200">
              <span>2. 融合位置的稠密特征矩阵</span>
              <span className="text-indigo-400">[batch, seq_len, d_model]</span>
            </div>

            <div className="text-center text-slate-600">
              ↓ 循环穿过 N 层 Transformer Block (堆叠 32 ~ 80 层)
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1.5 text-purple-200">
              <div className="font-bold flex items-center justify-between">
                <span>3. Transformer Block (单层内部)</span>
                <span className="text-[10px] text-purple-300">Pre-LN 残差结构</span>
              </div>
              <p className="text-[11px] text-purple-300/80 pl-2">
                ↳ LayerNorm → 因果多头自注意力 (Causal MHA) → + 残差<br />
                ↳ LayerNorm → 升维前馈网络 (FFN) → + 残差
              </p>
            </div>

            <div className="text-center text-slate-600">↓ 最终层归一化 + 线性投影头</div>

            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-emerald-200 font-bold">
              <span>4. 全词表下一个词得分 (Logits)</span>
              <span className="text-emerald-400">[batch, seq_len, vocab_size]</span>
            </div>
          </div>
        </div>
      </section>

      {/* 练习与测验 */}
      <QuizModal
        chapterTitle="第 4 章：Transformer 完整架构"
        questions={chapterQuizzes}
        onComplete={() => onCompleteQuiz()}
      />
    </div>
  );
};
