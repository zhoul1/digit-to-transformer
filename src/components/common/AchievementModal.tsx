import React from 'react';
import { Award, X, CheckCircle2, Lock, Sparkles, Trophy, Star } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percentage = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 to-purple-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-lg">
                认知升级勋章陈列室
              </h3>
              <p className="text-xs text-slate-400">
                记录你从手写数字识别一路通往 Transformer 大语言模型的每一步飞跃
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

        {/* 成就概览卡 */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">总体掌握进度</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {unlockedCount} / {achievements.length}
              </span>
              <span className="text-xs text-amber-400 font-bold">({percentage}% 已解锁)</span>
            </div>
          </div>

          <div className="w-36 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 勋章卡片网格 */}
        <div className="p-6 overflow-y-auto max-h-[55vh] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {achievements.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.unlocked
                    ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-65'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    item.unlocked
                      ? `bg-gradient-to-br ${item.badgeColor} text-white shadow-indigo-500/20`
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.unlocked ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-100 truncate">
                      {item.title}
                    </h4>
                    {item.unlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        已达成
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">未解锁</span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {item.description}
                  </p>

                  {item.progress && (
                    <div className="mt-2 text-[10px] text-indigo-400 font-mono">
                      进度: {item.progress.current} / {item.progress.total}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
