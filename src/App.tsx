import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  PenTool,
  Network,
  Cpu,
  Code2,
  Terminal,
  Trophy,
} from 'lucide-react';
import { ActiveTab, ChapterId, Achievement } from './types';
import { CHAPTERS } from './data/chaptersData';
import { INITIAL_ACHIEVEMENTS } from './data/achievementsData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Chapter1Digits } from './components/chapters/Chapter1Digits';
import { Chapter2Sequence } from './components/chapters/Chapter2Sequence';
import { Chapter3Attention } from './components/chapters/Chapter3Attention';
import { Chapter4Transformer } from './components/chapters/Chapter4Transformer';
import { Chapter5LLMGen } from './components/chapters/Chapter5LLMGen';
import { DigitCanvasPlayground } from './components/playgrounds/DigitCanvasPlayground';
import { AttentionPlayground } from './components/playgrounds/AttentionPlayground';
import { LLMGenerationPlayground } from './components/playgrounds/LLMGenerationPlayground';
import { CodeSandboxPlayground } from './components/playgrounds/CodeSandboxPlayground';
import { PyTorchHubPlayground } from './components/playgrounds/PyTorchHubPlayground';
import { CalculusCourse } from './components/math/CalculusCourse';
import { ProbabilityCourse } from './components/math/ProbabilityCourse';
import { StatisticsCourse } from './components/math/StatisticsCourse';
import { GlossaryModal } from './components/common/GlossaryModal';
import { AchievementModal } from './components/common/AchievementModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chapters');
  const [currentChapterId, setCurrentChapterId] = useState<ChapterId>('chapter-1');
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('d2t_completed_chapters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('d2t_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        return INITIAL_ACHIEVEMENTS.map((a) => {
          const found = parsed.find((p: any) => p.id === a.id);
          return found ? { ...a, unlocked: found.unlocked, progress: found.progress || a.progress } : a;
        });
      }
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [passedChallenges, setPassedChallenges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('d2t_passed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const unlockBadge = (badgeId: string) => {
    setAchievements((prev) => {
      const updated = prev.map((item) => {
        if (item.id === badgeId && !item.unlocked) {
          return { ...item, unlocked: true };
        }
        return item;
      });
      try {
        localStorage.setItem('d2t_achievements', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleChallengePassed = (chId: string) => {
    if (!passedChallenges.includes(chId)) {
      const updated = [...passedChallenges, chId];
      setPassedChallenges(updated);
      try {
        localStorage.setItem('d2t_passed_challenges', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      setAchievements((prev) => {
        const next = prev.map((a) => {
          if (a.id === 'badge-code') {
            const cur = updated.length;
            const isUnlocked = cur >= 4;
            return {
              ...a,
              unlocked: isUnlocked,
              progress: { current: cur, total: 4 },
            };
          }
          return a;
        });
        try {
          localStorage.setItem('d2t_achievements', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const markChapterComplete = (id: string) => {
    if (!completedChapters.includes(id)) {
      const updated = [...completedChapters, id];
      setCompletedChapters(updated);
      try {
        localStorage.setItem('d2t_completed_chapters', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    if (id === 'chapter-1') unlockBadge('badge-digit');
    if (id === 'chapter-2') unlockBadge('badge-embedding');
    if (id === 'chapter-3') unlockBadge('badge-attention');
    if (id === 'chapter-4') unlockBadge('badge-transformer');
    if (id === 'chapter-5') unlockBadge('badge-llm');
  };

  const currentIdx = CHAPTERS.findIndex((c) => c.id === currentChapterId);
  const prevChapter = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
  const nextChapter = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;

  const unlockedBadgeCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 顶部全局导航 */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedChapters={completedChapters}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        unlockedBadgeCount={unlockedBadgeCount}
        totalBadgeCount={achievements.length}
      />

      {/* 主体区域 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 如果处于教程通读页 */}
        {activeTab === 'chapters' && (
          <div className="space-y-8">
            {/* 顶部认知大地图 Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>极简直觉 · 动画推导 · 代码实操 · 拒绝黑话</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  从手写数字识别到 Transformer 大语言模型
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  你不需要高等数学或者深度学习背景。从最简单的 28×28 像素手绘画板开始，带你拆解神经元加权求和、Softmax 概率分布、Token 序列、自注意力 QKV 图书馆隐喻，直到亲手操纵大模型的自回归生成与 Temperature 采样！
                </p>

                {/* 5 步跨越连线图 */}
                <div className="pt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200">
                    ① 28×28 像素矩阵
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200">
                    ② 线性加权 & Softmax
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200">
                    ③ 序列与 Token
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200">
                    ④ QKV 自注意力
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 font-bold">
                    ⑤ GPT 自回归生成
                  </span>
                </div>
              </div>
            </div>

            {/* 侧边栏与当前章节文章 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Sidebar
                currentChapterId={currentChapterId}
                onSelectChapter={setCurrentChapterId}
                completedChapters={completedChapters}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <div className="flex-1 min-w-0 w-full space-y-8">
                {currentChapterId === 'chapter-1' && (
                  <Chapter1Digits
                    setActiveTab={setActiveTab}
                    onCompleteQuiz={() => markChapterComplete('chapter-1')}
                  />
                )}
                {currentChapterId === 'chapter-2' && (
                  <Chapter2Sequence
                    setActiveTab={setActiveTab}
                    onCompleteQuiz={() => markChapterComplete('chapter-2')}
                  />
                )}
                {currentChapterId === 'chapter-3' && (
                  <Chapter3Attention
                    setActiveTab={setActiveTab}
                    onCompleteQuiz={() => markChapterComplete('chapter-3')}
                  />
                )}
                {currentChapterId === 'chapter-4' && (
                  <Chapter4Transformer
                    setActiveTab={setActiveTab}
                    onCompleteQuiz={() => markChapterComplete('chapter-4')}
                  />
                )}
                {currentChapterId === 'chapter-5' && (
                  <Chapter5LLMGen
                    setActiveTab={setActiveTab}
                    onCompleteQuiz={() => markChapterComplete('chapter-5')}
                  />
                )}

                {/* 上一节 / 下一节导航按钮 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
                  {prevChapter ? (
                    <button
                      onClick={() => {
                        setCurrentChapterId(prevChapter.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>上一节：{prevChapter.title.split('：')[0]}</span>
                    </button>
                  ) : <div />}

                  {nextChapter && (
                    <button
                      onClick={() => {
                        setCurrentChapterId(nextChapter.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <span>下一节：{nextChapter.title.split('：')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI 数学基石课程 1：微积分 */}
        {activeTab === 'math-calculus' && (
          <CalculusCourse
            setActiveTab={setActiveTab}
            onCompleteQuiz={() => unlockBadge('badge-math-calculus')}
          />
        )}

        {/* AI 数学基石课程 2：概率论 */}
        {activeTab === 'math-probability' && (
          <ProbabilityCourse
            setActiveTab={setActiveTab}
            onCompleteQuiz={() => unlockBadge('badge-math-probability')}
          />
        )}

        {/* AI 数学基石课程 3：统计学 */}
        {activeTab === 'math-statistics' && (
          <StatisticsCourse
            setActiveTab={setActiveTab}
            onCompleteQuiz={() => unlockBadge('badge-math-statistics')}
          />
        )}

        {/* 独立实战工坊 1：手写画板 */}
        {activeTab === 'playground-digit' && (
          <DigitCanvasPlayground onPredict={() => unlockBadge('badge-digit')} />
        )}

        {/* 独立实战工坊 2：自注意力矩阵 */}
        {activeTab === 'playground-attention' && <AttentionPlayground />}

        {/* 独立实战工坊 3：微型大模型生成 */}
        {activeTab === 'playground-llm' && <LLMGenerationPlayground />}

        {/* 独立实战工坊 4：代码沙盒练习 */}
        {activeTab === 'code-sandbox' && (
          <CodeSandboxPlayground onChallengePassed={handleChallengePassed} />
        )}

        {/* 独立实战工坊 5：PyTorch 源码库 */}
        {activeTab === 'pytorch-hub' && <PyTorchHubPlayground />}
      </main>

      {/* 术语概念速查手册弹窗 */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* 认知升级勋章陈列室弹窗 */}
      <AchievementModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* 页脚 */}
      <footer className="mt-16 border-t border-slate-900 bg-[#04060c] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>从手写数字识别到 Transformer 大语言模型 · 零门槛沉浸式交互探索平台</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>纯前端驱动 · 本地极速推断</span>
            <span>•</span>
            <span>React + TypeScript + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
