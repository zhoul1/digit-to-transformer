import React from 'react';
import { ActiveTab } from '../types';
import {
  Brain,
  Layers,
  Sparkles,
  Code2,
  Terminal,
  Cpu,
  BookOpen,
  Award,
  PenTool,
  Trophy,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  completedChapters: string[];
  onOpenGlossary: () => void;
  onOpenAchievements: () => void;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedChapters,
  onOpenGlossary,
  onOpenAchievements,
  unlockedBadgeCount,
  totalBadgeCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'chapters', label: '沉浸教程', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playground-digit', label: '手写画板', icon: <PenTool className="w-4 h-4" />, badge: '实战' },
    { id: 'playground-attention', label: '自注意力', icon: <Layers className="w-4 h-4" />, badge: '核心' },
    { id: 'playground-llm', label: '微型LLM', icon: <Cpu className="w-4 h-4" />, badge: '沙盒' },
    { id: 'code-sandbox', label: '代码练习', icon: <Code2 className="w-4 h-4" />, badge: '挑战' },
    { id: 'pytorch-hub', label: 'PyTorch库', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#060911]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('chapters')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  从数字识别到大模型
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  零门槛交互
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                MNIST → Softmax → QKV Attention → GPT
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-indigo-500/30 text-indigo-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Progress & Quick Tool Modals */}
          <div className="flex items-center gap-2">
            {/* 概念词典速查按钮 */}
            <button
              onClick={onOpenGlossary}
              title="查看深度学习核心术语速查手册"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">概念词典</span>
            </button>

            {/* 成就勋章陈列室按钮 */}
            <button
              onClick={onOpenAchievements}
              title="打开认知升级勋章陈列室"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 border border-amber-500/30 text-xs text-amber-200 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>勋章:</span>
              <span className="font-mono font-bold text-amber-300">
                {unlockedBadgeCount}/{totalBadgeCount}
              </span>
            </button>

            {/* 章节通读徽章 */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>通读:</span>
              <span className="font-mono font-bold text-indigo-300">
                {completedChapters.length}/5
              </span>
            </div>

            {/* Mobile Dropdown */}
            <div className="flex md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as ActiveTab)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              >
                {navItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
