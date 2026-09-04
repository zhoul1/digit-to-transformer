import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Lightbulb, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../../types';

interface QuizModalProps {
  questions: QuizQuestion[];
  chapterTitle: string;
  onComplete?: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  questions,
  chapterTitle,
  onComplete,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [id: string]: number }>({});
  const [showExplanations, setShowExplanations] = useState<{ [id: string]: boolean }>({});
  const [showHints, setShowHints] = useState<{ [id: string]: boolean }>({});

  const handleSelect = (qId: string, optIdx: number, correctIdx: number) => {
    if (selectedAnswers[qId] !== undefined) return; // 已答过不可更改

    const updated = { ...selectedAnswers, [qId]: optIdx };
    setSelectedAnswers(updated);
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));

    // 检查是否全部完成
    const answeredCount = Object.keys(updated).length;
    if (answeredCount === questions.length) {
      let correctCount = 0;
      questions.forEach((q) => {
        if (updated[q.id] === q.correctIndex) correctCount++;
      });

      if (correctCount === questions.length) {
        // 全对放礼花庆祝！
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      if (onComplete) onComplete(correctCount);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowExplanations({});
    setShowHints({});
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="my-8 p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">
              本章闯关练习 · 概念诊断
            </h3>
            <p className="text-xs text-slate-400">
              {chapterTitle} — 共 {questions.length} 道精选实战小题
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">得分:</span>
            <span className="font-bold text-amber-400">
              {correctCount} / {questions.length}
            </span>
          </div>
          {answeredCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重练</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                    {idx + 1}
                  </span>
                  <p className="font-medium text-slate-200 text-sm sm:text-base leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {q.hint && !isAnswered && (
                  <button
                    onClick={() =>
                      setShowHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                    }
                    className="flex-shrink-0 text-slate-400 hover:text-amber-400 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="查看提示"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>提示</span>
                  </button>
                )}
              </div>

              {/* 提示 */}
              {showHints[q.id] && !isAnswered && (
                <div className="my-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
                  💡 <strong>思路提示：</strong> {q.hint}
                </div>
              )}

              {/* 选项 */}
              <div className="grid grid-cols-1 gap-2.5 mt-4">
                {q.options.map((opt, optIdx) => {
                  let btnStyle =
                    'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/50';

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      btnStyle =
                        'border-emerald-500/80 bg-emerald-500/15 text-emerald-300 font-medium';
                    } else if (optIdx === selected) {
                      btnStyle =
                        'border-rose-500/80 bg-rose-500/15 text-rose-300 font-medium';
                    } else {
                      btnStyle = 'border-slate-800/50 bg-slate-950/30 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, optIdx, q.correctIndex)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {isAnswered && optIdx === selected && optIdx !== q.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 解析说明 */}
              {showExplanations[q.id] && (
                <div
                  className={`mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {isCorrect ? (
                      <span className="text-emerald-400">🎉 回答正确！</span>
                    ) : (
                      <span className="text-rose-400">❌ 回答错误，别灰心，看看解析：</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
