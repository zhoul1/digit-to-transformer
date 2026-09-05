import React, { useState } from 'react';
import { BookOpen, X, Search, Sparkles, Tag, ExternalLink } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { GlossaryItem } from '../../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTermId?: string;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  defaultTermId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GlossaryItem>(() => {
    if (defaultTermId) {
      const found = GLOSSARY_TERMS.find((t) => t.id === defaultTermId);
      if (found) return found;
    }
    return GLOSSARY_TERMS[0];
  });

  if (!isOpen) return null;

  const categories = [
    'all',
    '视觉与像素',
    '序列与向量',
    '注意力机制',
    'Transformer架构',
    '生成与采样',
  ];

  const filtered = GLOSSARY_TERMS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                深度学习与大模型核心概念速查手册
              </h3>
              <p className="text-[11px] text-slate-400">
                15 大核心术语通俗白话解读与数学本质速览
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索与分类过滤器 */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索术语 (如 Softmax, QKV, Temperature)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 主体两栏布局 */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* 左侧列表 */}
          <div className="w-full md:w-80 border-r border-slate-800/80 overflow-y-auto p-3 space-y-1.5 bg-slate-950/30">
            {filtered.map((item) => {
              const isActive = activeItem.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200 truncate">
                      {item.term}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                    {item.english}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {item.shortDef}
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                没有找到匹配的术语
              </div>
            )}
          </div>

          {/* 右侧详情 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
                <Tag className="w-3 h-3" />
                <span>{activeItem.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeItem.term}
              </h2>
              <div className="text-xs font-mono text-indigo-400 mt-0.5">
                {activeItem.english}
              </div>
            </div>

            {/* 一句话大白话直觉 */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
              <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>一句话秒懂本质：</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {activeItem.shortDef}
              </p>
            </div>

            {/* 数学公式 (如果有) */}
            {activeItem.formula && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-mono font-semibold">
                  数学算式 / 核心表达:
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-xs sm:text-sm text-emerald-300 border border-slate-800 text-center">
                  {activeItem.formula}
                </div>
              </div>
            )}

            {/* 深度全景解析 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                深入原理与大模型应用机制
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                {activeItem.fullExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
