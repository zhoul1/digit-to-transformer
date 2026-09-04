import React, { useState, useMemo } from 'react';
import {
  Network,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import {
  computeScaledDotProductAttention,
} from '../../utils/attentionMath';

export const AttentionPlayground: React.FC = () => {
  // 预设句子
  const PRESET_SENTENCES = [
    { label: '🤖 AI 前沿', tokens: ['大', '模', '型', '改', '变', '未', '来'] },
    { label: '🔢 数字序列', tokens: ['3', '1', '4', '1', '5', '9'] },
    { label: '🍎 语义歧义', tokens: ['苹', '果', '发', '布', '新', '机'] },
    { label: '📖 极简测试', tokens: ['我', '爱', '学', '习'] },
  ];

  const [tokens, setTokens] = useState<string[]>(PRESET_SENTENCES[0].tokens);
  const [customInput, setCustomInput] = useState<string>('');
  const [useCausalMask, setUseCausalMask] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(4); // 默认停在核心热力图
  const [activeHead, setActiveHead] = useState<number>(1);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // 为每个 Token 模拟生成 4 维嵌入向量
  const embeddings = useMemo(() => {
    return tokens.map((token, i) => {
      // 确定性伪随机向量
      const seed = token.charCodeAt(0) * 17 + i * 31;
      return [
        Math.sin(seed) * 1.5,
        Math.cos(seed) * 1.5,
        Math.sin(seed * 2) * 1.5,
        Math.cos(seed * 2) * 1.5,
      ].map((v) => Number(v.toFixed(2)));
    });
  }, [tokens]);

  // 模拟三个不同注意头（Head）的权重投影微调
  const { Q, K, V } = useMemo(() => {
    const headFactor = activeHead === 1 ? 1.0 : activeHead === 2 ? 1.4 : 0.7;
    const qMat = embeddings.map((vec) =>
      vec.map((v, i) => Number((v * headFactor + (i === 0 ? 0.5 : 0)).toFixed(2)))
    );
    const kMat = embeddings.map((vec) =>
      vec.map((v, i) => Number((v * 1.1 + (i === 1 ? 0.3 : 0)).toFixed(2)))
    );
    const vMat = embeddings.map((vec) =>
      vec.map((v, i) => Number((v * 0.9 + (i === 2 ? 0.4 : 0)).toFixed(2)))
    );
    return { Q: qMat, K: kMat, V: vMat };
  }, [embeddings, activeHead]);

  // 计算完整的自注意力全套矩阵
  const attentionResult = useMemo(() => {
    return computeScaledDotProductAttention(Q, K, V, useCausalMask, 1.0);
  }, [Q, K, V, useCausalMask]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const items = customInput.trim().split(/\s+/).filter(Boolean);
    if (items.length >= 2 && items.length <= 8) {
      setTokens(items);
      setCustomInput('');
    } else {
      alert('请输入 2 到 8 个词或数字，以空格分隔');
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Q / K / V 向量生成', desc: '输入词转换为 Query (查询)、Key (键) 与 Value (值)' },
    { num: 2, title: '点积相关度矩阵 Q · Kᵀ', desc: '两两计算词与词之间的原始语义相关度分值' },
    { num: 3, title: '缩放除以 √d_k', desc: '防止点积过大导致 Softmax 梯度饱和' },
    { num: 4, title: '因果掩码 (Causal Mask)', desc: '遮蔽未来时刻词，确保单向自回归因果规律' },
    { num: 5, title: 'Softmax 注意力权重热力图', desc: '按行归一化为百分比，决定分配多少注意力' },
    { num: 6, title: '加权输出 Attention · V', desc: '融合整句话上下文信息的全新高维语义向量' },
  ];

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Network className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                交互式自注意力机制演算实验室 (Self-Attention Lab)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              亲自动手输入 Token 序列，透视 Q、K、V 是如何通过点积、缩放、因果下三角掩码与 Softmax 融合出上下文注意力的！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseCausalMask(!useCausalMask)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                useCausalMask
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>因果掩码 (Causal Mask): {useCausalMask ? '开启 (GPT生成)' : '关闭 (BERT双向)'}</span>
            </button>
          </div>
        </div>

        {/* 预设句子快速切换 */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-2">快速载入示例:</span>
          {PRESET_SENTENCES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setTokens(p.tokens)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                tokens.join(' ') === p.tokens.join(' ')
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}

          {/* 自定义输入框 */}
          <form onSubmit={handleApplyCustom} className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="自定义词，如: 我 爱 学 习 (空格隔开)"
              className="px-3 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              应用
            </button>
          </form>
        </div>
      </div>

      {/* 步骤条导航 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stepsInfo.map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(s.num)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeStep === s.num
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-indigo-400">
                STEP {s.num}
              </span>
              {activeStep === s.num && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <div className="font-bold text-xs text-slate-200 truncate">{s.title}</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* 多头注意力 (Multi-Head) 视角切换 */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-200">多头注意力视角 (Multi-Head Attention):</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 1, name: 'Head 1 (主语/客语关联头)' },
            { id: 2, name: 'Head 2 (远距离因果头)' },
            { id: 3, name: 'Head 3 (就近修饰头)' },
          ].map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHead(h.id)}
              className={`px-3 py-1 rounded-lg font-medium border transition-all cursor-pointer ${
                activeHead === h.id
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* 核心演算视图区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：步骤动态交互区 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl min-h-[420px]">
            {/* 步骤 1: Q, K, V 向量展示 */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm">
                    Token 词嵌入与 Q (Query), K (Key), V (Value) 投影
                  </h3>
                  <span className="text-xs text-indigo-400 font-mono">
                    d_k = 4 维投影特征
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  每个词首先变成高维嵌入向量 $X$，随后分别乘以三组独立权重矩阵 $W_Q, W_K, W_V$ 生成三份不同使命的向量：
                </p>

                <div className="space-y-3">
                  {tokens.map((token, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center font-mono">
                          {i}
                        </span>
                        <span className="font-bold text-slate-100 text-sm">{token}</span>
                      </div>

                      <div className="font-mono text-[11px] p-1.5 rounded bg-blue-950/40 border border-blue-500/20 text-blue-300">
                        <span className="text-slate-500 block text-[9px]">Query (查询):</span>
                        [{Q[i].join(', ')}]
                      </div>

                      <div className="font-mono text-[11px] p-1.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                        <span className="text-slate-500 block text-[9px]">Key (标签):</span>
                        [{K[i].join(', ')}]
                      </div>

                      <div className="font-mono text-[11px] p-1.5 rounded bg-amber-950/40 border border-amber-500/20 text-amber-300">
                        <span className="text-slate-500 block text-[9px]">Value (内容):</span>
                        [{V[i].join(', ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 步骤 2, 3, 4, 5: 矩阵热力图演进 */}
            {activeStep >= 2 && activeStep <= 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm">
                    {activeStep === 2 && '步骤 2：原始点积矩阵 (Scores = Q · Kᵀ)'}
                    {activeStep === 3 && '步骤 3：缩放矩阵 (Scores / √d_k)'}
                    {activeStep === 4 && '步骤 4：因果掩码遮蔽 (Causal Masked)'}
                    {activeStep === 5 && '步骤 5：Softmax 注意力权重热力图 (Attention Weights)'}
                  </h3>
                  <span className="text-xs text-indigo-400 font-mono">
                    {tokens.length} × {tokens.length} 交互矩阵
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {activeStep === 2 && '任意两个词之间的相似度通过对应 Query 与 Key 的点积衡量。数值越大，代表两词在语义上相关性越强。'}
                  {activeStep === 3 && '为了防止特征维度较大时点积方差爆炸，统一除以 √d_k (此处 √4 = 2.0)。'}
                  {activeStep === 4 && '在 GPT 等生成模型中，词只能看过去的词。右上角未来词被填充为 -∞ (负无穷)，在 Softmax 之后变成绝对的 0%。'}
                  {activeStep === 5 && '鼠标悬停在下方矩阵的任意格子上，右侧面板将实时展示两词之间的交互细节与权重百分比：'}
                </p>

                {/* 矩阵渲染器 */}
                <div className="overflow-x-auto p-2">
                  <div className="inline-block min-w-full">
                    {/* 列标头 */}
                    <div className="flex items-center mb-1 pl-16">
                      {tokens.map((token, j) => (
                        <div
                          key={j}
                          className="w-14 text-center font-bold text-slate-300 text-xs truncate"
                          title={token}
                        >
                          {token}
                        </div>
                      ))}
                    </div>

                    {/* 矩阵行 */}
                    {tokens.map((rowToken, i) => (
                      <div key={i} className="flex items-center mb-1">
                        {/* 行标头 */}
                        <div className="w-16 flex items-center gap-1.5 text-xs font-bold text-slate-300 pr-2">
                          <span className="text-[10px] text-indigo-400 font-mono">{i}</span>
                          <span className="truncate">{rowToken}</span>
                        </div>

                        {/* 各列单元格 */}
                        {tokens.map((colToken, j) => {
                          const isMasked = useCausalMask && j > i;
                          const rawVal = attentionResult.scoresRaw[i][j];
                          const scaledVal = attentionResult.scoresScaled[i][j];
                          const weightVal = attentionResult.attentionWeights[i][j];

                          let displayVal = '';
                          let cellBg = '';

                          if (activeStep === 2) {
                            displayVal = rawVal.toFixed(1);
                            cellBg = rawVal > 0 ? 'bg-indigo-900/60' : 'bg-slate-900';
                          } else if (activeStep === 3) {
                            displayVal = scaledVal.toFixed(1);
                            cellBg = scaledVal > 0 ? 'bg-indigo-900/60' : 'bg-slate-900';
                          } else if (activeStep === 4) {
                            if (isMasked) {
                              displayVal = '-∞';
                              cellBg = 'bg-rose-950/40 text-rose-400';
                            } else {
                              displayVal = scaledVal.toFixed(1);
                              cellBg = 'bg-indigo-900/60';
                            }
                          } else {
                            // 步骤 5: Softmax 热力图
                            displayVal = `${(weightVal * 100).toFixed(0)}%`;
                            const alpha = Math.min(1, Math.max(0.08, weightVal));
                            cellBg = `rgba(99, 102, 241, ${alpha})`;
                          }

                          const isHovered =
                            hoveredCell?.row === i && hoveredCell?.col === j;

                          return (
                            <div
                              key={j}
                              onMouseEnter={() => setHoveredCell({ row: i, col: j })}
                              onMouseLeave={() => setHoveredCell(null)}
                              style={{
                                backgroundColor:
                                  activeStep === 5 ? cellBg : undefined,
                              }}
                              className={`w-14 h-11 flex flex-col items-center justify-center rounded-lg border text-xs font-mono transition-all cursor-pointer m-0.5 select-none ${
                                isHovered
                                  ? 'border-white scale-110 shadow-xl z-10'
                                  : 'border-slate-800/80 hover:border-indigo-400'
                              } ${activeStep !== 5 ? cellBg : ''} ${
                                isMasked && activeStep >= 4
                                  ? 'text-slate-600 bg-slate-950/80 border-dashed'
                                  : 'text-slate-100 font-semibold'
                              }`}
                            >
                              <span>{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 步骤 6: 最终加权聚合输出 */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-100 text-sm">
                    步骤 6：注意力加权汇聚结果 (Output = Attention · V)
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">
                    融合全句语境的新向量
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  此时每一个词不再是最初孤立的那个词了！它吸收了整句话中与它最相关的词的信息，具备了强大的**语境感知力**：
                </p>

                <div className="space-y-3">
                  {tokens.map((token, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono">
                          {i}
                        </span>
                        <div>
                          <span className="font-bold text-slate-100 text-sm">{token}</span>
                          <span className="text-slate-400 text-[11px] ml-2">
                            (聚合了全句 Value 信息)
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-xs text-emerald-300 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        [{attentionResult.output[i].map((v) => v.toFixed(2)).join(', ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：检查器与原理解读 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-slate-200 text-sm">注意力探测仪</h4>
            </div>

            {hoveredCell ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>当前查询词 (Query):</span>
                    <strong className="text-indigo-400 text-sm">
                      "{tokens[hoveredCell.row]}" (位置 {hoveredCell.row})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>被关注目标 (Key):</span>
                    <strong className="text-emerald-400 text-sm">
                      "{tokens[hoveredCell.col]}" (位置 {hoveredCell.col})
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>原始点积 (Q · Kᵀ):</span>
                    <span className="font-mono text-slate-200">
                      {attentionResult.scoresRaw[hoveredCell.row][hoveredCell.col].toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>除以 √d_k (缩放):</span>
                    <span className="font-mono text-slate-200">
                      {attentionResult.scoresScaled[hoveredCell.row][hoveredCell.col].toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>掩码后分值:</span>
                    <span className="font-mono text-slate-200">
                      {useCausalMask && hoveredCell.col > hoveredCell.row
                        ? '-Infinity (遮蔽)'
                        : attentionResult.scoresMasked[hoveredCell.row][hoveredCell.col].toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-xs font-bold text-indigo-300">
                    <span>最终注意力权重:</span>
                    <span className="font-mono text-emerald-400 text-sm">
                      {(attentionResult.attentionWeights[hoveredCell.row][hoveredCell.col] * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200 leading-relaxed">
                  💡 <strong>通俗含义：</strong> 当模型阅读到“{tokens[hoveredCell.row]}”时，它投入了约{' '}
                  <strong className="text-white">
                    {(attentionResult.attentionWeights[hoveredCell.row][hoveredCell.col] * 100).toFixed(0)}%
                  </strong>{' '}
                  的精力来提取“{tokens[hoveredCell.col]}”的特征内容。
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                👉 把鼠标移动到左侧矩阵的任意单元格上，这里将实时为你展示两词交互的数学计算全流程！
              </div>
            )}
          </div>

          {/* 经典 QKV 图书馆隐喻小贴士 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>图书馆借书隐喻速查</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              • <strong>Query (Q)</strong>：读者手里的借书清单（我想找什么？）<br />
              • <strong>Key (K)</strong>：图书书脊上的分类标签（这本书关于什么？）<br />
              • <strong>Dot Product</strong>：清单与书签的吻合度打分<br />
              • <strong>Value (V)</strong>：书本里的真实知识内容
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
