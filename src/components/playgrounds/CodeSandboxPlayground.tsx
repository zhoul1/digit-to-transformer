import React, { useState } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CODE_CHALLENGES } from '../../data/codeChallengesData';
import { CodeChallenge } from '../../types';

export const CodeSandboxPlayground: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge>(
    CODE_CHALLENGES[0]
  );
  const [userCode, setUserCode] = useState<string>(CODE_CHALLENGES[0].starterCode);
  const [testResults, setTestResults] = useState<
    { inputName: string; passed: boolean; message: string }[]
  >([]);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [allPassed, setAllPassed] = useState<boolean>(false);

  // 切换题目
  const handleSelectChallenge = (c: CodeChallenge) => {
    setSelectedChallenge(c);
    setUserCode(c.starterCode);
    setTestResults([]);
    setShowSolution(false);
    setAllPassed(false);
  };

  // 重置代码
  const handleResetCode = () => {
    setUserCode(selectedChallenge.starterCode);
    setTestResults([]);
    setShowSolution(false);
    setAllPassed(false);
  };

  // 运行测试
  const handleRunTests = () => {
    try {
      // 通过 new Function 在前端安全包装用户函数并执行
      // 将代码中的函数提取并执行
      const wrappedScript = `
        ${userCode};
        if (typeof softmax !== 'undefined') return softmax;
        if (typeof scaledDotProduct !== 'undefined') return scaledDotProduct;
        if (typeof createCausalMask !== 'undefined') return createCausalMask;
        if (typeof applyTemperature !== 'undefined') return applyTemperature;
        throw new Error('未检测到预期的函数定义，请检查函数名称是否正确');
      `;
      // eslint-disable-next-line no-new-func
      const userFn = new Function(wrappedScript)();

      const results = selectedChallenge.testCases.map((tc) => {
        const res = tc.validate(userFn);
        return {
          inputName: tc.inputName,
          passed: res.passed,
          message: res.message,
        };
      });

      setTestResults(results);

      const isSuccess = results.every((r) => r.passed);
      setAllPassed(isSuccess);

      if (isSuccess) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setTestResults([
        {
          inputName: '语法/编译检查',
          passed: false,
          message: `代码解析失败: ${err.message}`,
        },
      ]);
      setAllPassed(false);
    }
  };

  const handleFillAndRun = () => {
    setUserCode(selectedChallenge.solutionCode);
    setShowSolution(true);
    try {
      const wrappedScript = `
        ${selectedChallenge.solutionCode};
        if (typeof softmax !== 'undefined') return softmax;
        if (typeof scaledDotProduct !== 'undefined') return scaledDotProduct;
        if (typeof createCausalMask !== 'undefined') return createCausalMask;
        if (typeof applyTemperature !== 'undefined') return applyTemperature;
        throw new Error('未检测到预期的函数定义');
      `;
      // eslint-disable-next-line no-new-func
      const userFn = new Function(wrappedScript)();
      const results = selectedChallenge.testCases.map((tc) => tc.validate(userFn));
      setTestResults(
        results.map((r, i) => ({
          inputName: selectedChallenge.testCases[i].inputName,
          passed: r.passed,
          message: r.message,
        }))
      );
      setAllPassed(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题区 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Code2 className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                算法核心函数实战代码场 (Interactive Code Lab)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              亲自动手编写 Softmax、缩放点积、因果下三角掩码与温度采样算法，在浏览器内直接通过自动化测试用例！
            </p>
          </div>
        </div>

        {/* 题目选择器 */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          {CODE_CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedChallenge.id === c.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{c.title}</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-900/80 text-indigo-300">
                {c.difficulty}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 代码编辑器与测试台 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：代码编辑区 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">
                  {selectedChallenge.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  JavaScript / TypeScript
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="重置代码"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </div>

            {/* 题目要求 */}
            <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-indigo-400 mr-1">📝 任务要求：</span>
              {selectedChallenge.description}
            </div>

            {/* 可编辑代码文本域 */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full p-4 bg-transparent text-slate-200 font-mono text-xs sm:text-sm leading-relaxed resize-y focus:outline-none"
              />
            </div>

            {/* 运行与参考答案按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showSolution ? '收起参考答案' : '查看参考标准实现'}</span>
                </button>

                <button
                  onClick={handleFillAndRun}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>一键填入并跑通</span>
                </button>
              </div>

              <button
                onClick={handleRunTests}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>运行测试并验证 (Run Tests)</span>
              </button>
            </div>

            {/* 展开参考答案 */}
            {showSolution && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>标准参考实现：</span>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                  {selectedChallenge.solutionCode}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：测试用例控制台 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl min-h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-slate-200 text-sm">
                单元测试验证控制台
              </h4>
              {allPassed && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>全用例通过!</span>
                </div>
              )}
            </div>

            {testResults.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                👉 在左侧补全函数代码后，点击“运行测试并验证”，这里将实时展示用例执行与断言结果！
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {testResults.map((tr, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                      tr.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <div className="flex items-center gap-1.5">
                        {tr.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span>{tr.inputName}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase">
                        {tr.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-5">{tr.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
