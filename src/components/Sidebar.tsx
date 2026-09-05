import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronRight,
  PenTool,
  Network,
  Cpu,
  Code2,
  Calculator,
} from 'lucide-react';
import { CHAPTERS } from '../data/chaptersData';
import { ChapterId, ActiveTab } from '../types';

interface SidebarProps {
  currentChapterId: ChapterId;
  onSelectChapter: (id: ChapterId) => void;
  completedChapters: string[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentChapterId,
  onSelectChapter,
  completedChapters,
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* 课程进度卡片 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">认知升级路线图</h3>
          </div>
          <span className="font-mono text-xs font-bold text-indigo-400">
            {completedChapters.length} / {CHAPTERS.length} 完结
          </span>
        </div>

        {/* 进度条 */}
        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden mb-4 border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{
              width: `${(completedChapters.length / CHAPTERS.length) * 100}%`,
            }}
          />
        </div>

        {/* 5 个章节导航列表 */}
        <div className="space-y-1.5">
          {CHAPTERS.map((ch) => {
            const isCurrent = currentChapterId === ch.id && activeTab === 'chapters';
            const isCompleted = completedChapters.includes(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveTab('chapters');
                  onSelectChapter(ch.id);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-start gap-2.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="pt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      第 {ch.number} 节
                    </span>
                    <span className="text-[9px] text-slate-500">{ch.readTime.split('+')[0]}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200 truncate mt-0.5">
                    {ch.title.split('：')[0]}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {ch.title.split('：')[1] || ch.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI 数学基石 3 门核心课程快速入口 */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-purple-950/20 border border-indigo-500/30 shadow-xl space-y-2 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-100">
            <Calculator className="w-3.5 h-3.5 text-purple-400" />
            <span>AI 数学基石互动课</span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            核心底座
          </span>
        </div>

        <button
          onClick={() => setActiveTab('math-calculus')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'math-calculus'
              ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200 shadow-md'
              : 'border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>📐</span>
            <div className="text-left">
              <div className="font-semibold text-xs text-slate-200">微积分：梯度与链式法则</div>
              <div className="text-[10px] text-slate-500">导数 · 损失曲面 · 反向传播</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('math-probability')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'math-probability'
              ? 'bg-purple-600/25 border-purple-500 text-purple-200 shadow-md'
              : 'border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>🎲</span>
            <div className="text-left">
              <div className="font-semibold text-xs text-slate-200">概率论：贝叶斯与交叉熵</div>
              <div className="text-[10px] text-slate-500">条件概率 · 信息熵 · 高斯分布</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('math-statistics')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'math-statistics'
              ? 'bg-cyan-600/25 border-cyan-500 text-cyan-200 shadow-md'
              : 'border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>📊</span>
            <div className="text-left">
              <div className="font-semibold text-xs text-slate-200">统计学：中心极限与分布</div>
              <div className="text-[10px] text-slate-500">中心极限 · LayerNorm · 向量相关</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* 四大实战实验室快捷入口 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2.5 text-xs">
        <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>随学随练 · 实战工作台</span>
        </h4>

        <button
          onClick={() => setActiveTab('playground-digit')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'playground-digit'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
              : 'border-slate-800/70 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <PenTool className="w-3.5 h-3.5 text-indigo-400" />
            <span>手写数字识别画板</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('playground-attention')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'playground-attention'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
              : 'border-slate-800/70 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>自注意力演算实验室</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('playground-llm')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'playground-llm'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
              : 'border-slate-800/70 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>微型大模型生成沙盒</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('code-sandbox')}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'code-sandbox'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
              : 'border-slate-800/70 hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>核心算法代码挑战</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </aside>
  );
};
