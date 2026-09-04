import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronRight,
  TrendingUp,
  Flame,
  Filter,
} from 'lucide-react';
import {
  SCENARIOS,
  Scenario,
  computeNextTokenStep,
  GenerationStepResult,
} from '../../utils/tokenGenerator';

export const LLMGenerationPlayground: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [contextTokens, setContextTokens] = useState<string[]>(SCENARIOS[0].initialPrompt);
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topK, setTopK] = useState<number>(5);
  const [topP, setTopP] = useState<number>(0.9);
  const [sampleMode, setSampleMode] = useState<'sample' | 'greedy'>('sample');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastStepResult, setLastStepResult] = useState<GenerationStepResult | null>(null);

  const timerRef = useRef<any>(null);

  // 初始化或切换场景
  const handleSelectScenario = (sc: Scenario) => {
    setIsPlaying(false);
    setSelectedScenario(sc);
    setContextTokens([...sc.initialPrompt]);
    const step = computeNextTokenStep(sc.initialPrompt, sc, temperature, topK, topP, sampleMode);
    setLastStepResult(step);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setContextTokens([...selectedScenario.initialPrompt]);
    const step = computeNextTokenStep(
      selectedScenario.initialPrompt,
      selectedScenario,
      temperature,
      topK,
      topP,
      sampleMode
    );
    setLastStepResult(step);
  };

  // 单步自回归生成
  const stepGenerate = () => {
    if (contextTokens.length >= 24) {
      setIsPlaying(false);
      return;
    }

    const step = computeNextTokenStep(
      contextTokens,
      selectedScenario,
      temperature,
      topK,
      topP,
      sampleMode
    );
    setLastStepResult(step);
    setContextTokens((prev) => [...prev, step.currentToken]);
  };

  // 初始加载一次第一步预测
  useEffect(() => {
    const step = computeNextTokenStep(
      selectedScenario.initialPrompt,
      selectedScenario,
      temperature,
      topK,
      topP,
      sampleMode
    );
    setLastStepResult(step);
  }, []);

  // 自动播放循环
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setContextTokens((curr) => {
          if (curr.length >= 24) {
            setIsPlaying(false);
            return curr;
          }
          const step = computeNextTokenStep(
            curr,
            selectedScenario,
            temperature,
            topK,
            topP,
            sampleMode
          );
          setLastStepResult(step);
          return [...curr, step.currentToken];
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedScenario, temperature, topK, topP, sampleMode]);

  // 当滑动参数时，实时更新当前候选预测
  const handleParamChange = (newT: number, newK: number, newP: number) => {
    setTemperature(newT);
    setTopK(newK);
    setTopP(newP);
    const step = computeNextTokenStep(contextTokens, selectedScenario, newT, newK, newP, sampleMode);
    setLastStepResult(step);
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与场景切换 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Cpu className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                微型大语言模型自回归生成与采样实验室 (LLM Generation Lab)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              亲历大模型的核心心脏：自回归接龙！实时调节 Temperature、Top-K、Top-p，观察概率柱状图如何被塑形，见证 AI 如何逐词推理。
            </p>
          </div>

          <div className="flex items-center gap-2">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedScenario.id === sc.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 控制面板与文本生成展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：自回归上下文流与操作区 */}
        <div className="lg:col-span-7 space-y-4">
          {/* 上下文生成窗口 */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  当前上下文窗口 (Context Window)
                </span>
              </div>
              <span className="text-slate-400 font-mono">
                长度: {contextTokens.length} 个 Tokens
              </span>
            </div>

            {/* Token 展示流 */}
            <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 min-h-[140px] flex flex-wrap items-center content-start gap-2">
              {contextTokens.map((tok, idx) => {
                const isInitial = idx < selectedScenario.initialPrompt.length;
                const isLatest = idx === contextTokens.length - 1;

                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg font-mono text-sm font-bold transition-all ${
                      isLatest && !isInitial
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 border border-indigo-400 scale-105'
                        : isInitial
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/30'
                    }`}
                  >
                    {tok}
                  </span>
                );
              })}

              <span className="w-2 h-5 bg-indigo-400 animate-pulse rounded-sm" />
            </div>

            {/* 操作按钮组 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={stepGenerate}
                  disabled={isPlaying || contextTokens.length >= 24}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>单步生成 (Step Next)</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={contextTokens.length >= 24}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isPlaying
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>暂停生成</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>自动连续生成</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>重置 Prompt</span>
              </button>
            </div>
          </div>

          {/* 生成原理解读卡片 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>自回归循环四部曲 (Autoregressive Loop)</span>
            </div>
            <p>
              1. <strong>输入上下文</strong>：网络读取已知的前文所有 Tokens。<br />
              2. <strong>预测 Logits</strong>：通过多层 Transformer 计算整个词表的原始得分。<br />
              3. <strong>采样塑形</strong>：根据 Temperature、Top-K、Top-p 过滤并归一化为最终概率。<br />
              4. <strong>拼接入队</strong>：挑选出的下一个词追加到末尾，作为新的前文开始下一轮循环！
            </p>
          </div>
        </div>

        {/* 右侧：概率塑形器与词表分布 */}
        <div className="lg:col-span-5 space-y-4">
          {/* 超参数调节面板 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">采样控制调节台</h4>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setSampleMode('sample')}
                  className={`px-2 py-0.5 rounded ${
                    sampleMode === 'sample'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  多项采样
                </button>
                <button
                  onClick={() => setSampleMode('greedy')}
                  className={`px-2 py-0.5 rounded ${
                    sampleMode === 'greedy'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  贪婪确定
                </button>
              </div>
            </div>

            {/* 温度系数 Temperature 滑块 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  温度 (Temperature):
                </span>
                <span className="font-mono text-orange-400 font-bold text-sm">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={temperature}
                onChange={(e) =>
                  handleParamChange(parseFloat(e.target.value), topK, topP)
                }
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.05 (严谨确定)</span>
                <span>0.7 (平衡)</span>
                <span>2.0 (天马行空)</span>
              </div>
            </div>

            {/* Top-K 截断滑块 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  Top-K 候选数量:
                </span>
                <span className="font-mono text-blue-400 font-bold text-sm">
                  {topK}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={topK}
                onChange={(e) =>
                  handleParamChange(temperature, parseInt(e.target.value), topP)
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (仅挑第一名)</span>
                <span>4 (常用)</span>
                <span>8 (宽泛候选)</span>
              </div>
            </div>

            {/* Top-p 核采样滑块 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Top-p 核采样阈值:
                </span>
                <span className="font-mono text-purple-400 font-bold text-sm">
                  {topP.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={topP}
                onChange={(e) =>
                  handleParamChange(temperature, topK, parseFloat(e.target.value))
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.2 (极端收敛)</span>
                <span>0.9 (标准默认)</span>
                <span>1.0 (不过滤)</span>
              </div>
            </div>
          </div>

          {/* 下一个词预测概率分布柱状图 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <h4 className="font-bold text-slate-200">
                下一个 Token 候选概率分布
              </h4>
              <span className="text-indigo-400 font-mono text-[11px]">
                Softmax(Logits / T)
              </span>
            </div>

            <div className="space-y-2.5">
              {lastStepResult?.candidates.map((cand, idx) => {
                const isPicked = cand.isSampled;
                const isFiltered = !cand.inTopK || !cand.inTopP;
                const percent = (cand.prob * 100).toFixed(1);

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl transition-all border ${
                      isPicked
                        ? 'bg-indigo-950/60 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : isFiltered
                        ? 'bg-slate-950/30 border-slate-800/40 opacity-40'
                        : 'bg-slate-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 font-mono text-[10px] font-bold text-slate-300 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-slate-100 text-sm">
                          "{cand.token}"
                        </span>
                        {isPicked && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500 text-white font-bold">
                            本步选中
                          </span>
                        )}
                        {isFiltered && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-950/50 text-rose-400 border border-rose-500/30">
                            已截断
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-500 text-[10px]">
                          logit:{cand.logit.toFixed(1)}
                        </span>
                        <span
                          className={`font-bold ${
                            isPicked ? 'text-indigo-400 text-sm' : 'text-slate-300'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPicked
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            : isFiltered
                            ? 'bg-slate-700'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(2, cand.prob * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
