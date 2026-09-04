import React from 'react';
import { Lightbulb, Sparkles, BookOpen } from 'lucide-react';

interface MathCardProps {
  title: string;
  formula: string;
  plainTranslation: string;
  intuition: string;
  tags?: string[];
}

export const MathCard: React.FC<MathCardProps> = ({
  title,
  formula,
  plainTranslation,
  intuition,
  tags = [],
}) => {
  return (
    <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 border border-indigo-500/20 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-100 text-base">{title}</h4>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 公式展示区 */}
      <div className="my-3 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center font-mono text-base sm:text-lg text-indigo-300 font-semibold tracking-wide shadow-inner overflow-x-auto">
        <code>{formula}</code>
      </div>

      {/* 大白话解析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>大白话人话翻译</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{plainTranslation}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>核心认知直觉</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{intuition}</p>
        </div>
      </div>
    </div>
  );
};
