import React, { useState } from 'react';
import { Scale, Sparkles, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  desc: string;
  priorLabel: string;
  defaultPrior: number; // 0 ~ 1
  evidenceLabel: string;
  defaultSensitivity: number; // P(E|H)
  defaultFalsePositive: number; // P(E|~H)
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'medical',
    name: '罕见病筛查 (经典假阳性悖论)',
    desc: '当某罕见病患病率仅 1% 时，即使检测准确度高达 95%，一次阳性结果的真正患病率竟不到 20%！',
    priorLabel: '患病基础率 P(Disease)',
    defaultPrior: 0.01,
    evidenceLabel: '检测结果呈现阳性 (+)',
    defaultSensitivity: 0.95,
    defaultFalsePositive: 0.05,
    explanation: '由于健康人群基数（99%）远大于患病人群（1%），假阳性人数甚至远超真阳性人数。这是贝叶斯先验压倒似然度的最直观体现。',
  },
  {
    id: 'spam',
    name: '垃圾邮件分类器 (词频证据)',
    desc: '收到包含“特惠/限时大促”的邮件，它是垃圾邮件的真实概率是多少？',
    priorLabel: '邮箱中垃圾邮件比例 P(Spam)',
    defaultPrior: 0.2,
    evidenceLabel: '邮件包含促销敏感词 (+)',
    defaultSensitivity: 0.85,
    defaultFalsePositive: 0.1,
    explanation: '贝叶斯分类器是初代垃圾邮件过滤的工业标准，根据出现特征词的条件概率逆推是否为垃圾邮件。',
  },
  {
    id: 'llm',
    name: '大模型上下文概率校准 (Prompt 增强)',
    desc: '在没有 Prompt 引导下预测词的默认概率 vs 带有专业系统提示后的条件生成概率。',
    priorLabel: '无上下文先验 P(Topic=Code)',
    defaultPrior: 0.08,
    evidenceLabel: '输入包含 def / return / import 等代码词',
    defaultSensitivity: 0.9,
    defaultFalsePositive: 0.04,
    explanation: '大模型通过 Context（自注意力机制）源源不断为下一个 Token 的生成提供强有力的后验概率条件约束。',
  },
];

export const BayesBalanceLab: React.FC = () => {
  const [scenarioId, setScenarioId] = useState<string>('medical');
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  const [prior, setPrior] = useState<number>(scenario.defaultPrior);
  const [sensitivity, setSensitivity] = useState<number>(scenario.defaultSensitivity); // P(E|H)
  const [falsePositive, setFalsePositive] = useState<number>(scenario.defaultFalsePositive); // P(E|~H)

  // 切换场景
  const handleSelectScenario = (id: string) => {
    const s = SCENARIOS.find((item) => item.id === id) || SCENARIOS[0];
    setScenarioId(id);
    setPrior(s.defaultPrior);
    setSensitivity(s.defaultSensitivity);
    setFalsePositive(s.defaultFalsePositive);
  };

  // 贝叶斯公式推导
  // P(H) = prior, P(~H) = 1 - prior
  // P(E) = P(E|H)*P(H) + P(E|~H)*P(~H)
  // P(H|E) = (P(E|H) * P(H)) / P(E)
  const priorH = prior;
  const priorNotH = 1 - prior;
  const probE_given_H = sensitivity;
  const probE_given_NotH = falsePositive;

  const jointEH = probE_given_H * priorH; // 真阳性分子
  const jointENotH = probE_given_NotH * priorNotH; // 假阳性
  const probE = jointEH + jointENotH; // 全概率总阳性
  const posterior = probE > 0 ? jointEH / probE : 0; // 后验 P(H|E)

  // 以 1000 人为模拟样本池
  const totalPop = 1000;
  const countH = Math.round(totalPop * priorH);
  const countNotH = totalPop - countH;
  const truePositives = Math.round(countH * probE_given_H);
  const falseNegatives = countH - truePositives;
  const falsePositives = Math.round(countNotH * probE_given_NotH);
  const trueNegatives = countNotH - falsePositives;

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* 头部标题与场景切换 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              概率实验 1
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">
              贝叶斯天平与先验更新实验室 (Bayes Balance Lab)
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">{scenario.desc}</p>
        </div>

        {/* 场景按钮 */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                scenarioId === s.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 滑块控制组 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">先验概率 P(H)</span>
            <span className="font-mono text-purple-400 font-bold">{(prior * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.5"
            step="0.005"
            value={prior}
            onChange={(e) => setPrior(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">在获得新证据前的原始基础比例</span>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">敏感度 / 检出率 P(E|H)</span>
            <span className="font-mono text-emerald-400 font-bold">{(sensitivity * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="0.999"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">确实发生时，成功被检测出的概率</span>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">误报率 / 假阳性率 P(E|~H)</span>
            <span className="font-mono text-rose-400 font-bold">{(falsePositive * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.25"
            step="0.005"
            value={falsePositive}
            onChange={(e) => setFalsePositive(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">没有发生时，被误判为阳性的概率</span>
        </div>
      </div>

      {/* 视觉对比核心：1000 人群分流矩阵 & 最终后验卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：1000 个体方块人群分布直观图 */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-200">1,000 个样本的真实分类剖析</h4>
            <span className="text-slate-500 font-mono">总阳性 = 真阳性 + 假阳性</span>
          </div>

          {/* 分流比例长条图 */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>
                  所有呈现【阳性】的总人数: <strong className="text-white">{truePositives + falsePositives}</strong> 人
                </span>
                <span className="text-purple-400 font-mono">P(E) = {(probE * 100).toFixed(2)}%</span>
              </div>
              <div className="h-6 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${(truePositives / (truePositives + falsePositives || 1)) * 100}%` }}
                  className="bg-emerald-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                  title={`真阳性: ${truePositives} 人`}
                >
                  {truePositives > 0 ? `真阳性 ${truePositives}` : ''}
                </div>
                <div
                  style={{ width: `${(falsePositives / (truePositives + falsePositives || 1)) * 100}%` }}
                  className="bg-rose-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                  title={`假阳性: ${falsePositives} 人`}
                >
                  {falsePositives > 0 ? `假阳性 (误报) ${falsePositives}` : ''}
                </div>
              </div>
            </div>

            {/* 详细 4 格指标 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-medium block text-[11px]">真阳性 (TP)</span>
                <span className="text-base font-mono font-bold text-white">{truePositives}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">确实有且测出</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-400 font-medium block text-[11px]">假阳性 (FP 误报)</span>
                <span className="text-base font-mono font-bold text-white">{falsePositives}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">本来没有却误报</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">真阴性 (TN)</span>
                <span className="text-base font-mono font-bold text-slate-300">{trueNegatives}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">正常且安全排除</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-medium block text-[11px]">漏诊/假阴性 (FN)</span>
                <span className="text-base font-mono font-bold text-slate-300">{falseNegatives}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">确实有但漏检</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：贝叶斯后验计算大卡片 */}
        <div className="lg:col-span-5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
              最终贝叶斯后验概率 P(H | E)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                {(posterior * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">
                (先验 {(prior * 100).toFixed(1)}% → 观测阳性后跃升至 {(posterior * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* 贝叶斯公式展开 */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
            <div className="text-purple-300 font-bold">
              P(H|E) = \frac{'{P(E|H) \\cdot P(H)}'}{'{P(E)}'}
            </div>
            <div className="text-slate-400 border-t border-slate-800 pt-1 text-[11px] leading-relaxed">
              = \frac{'{\\text{真阳性}}'}{'{\\text{真阳性} + \\text{假阳性}}'} = \frac{`{${truePositives}}`}{`{${truePositives} + ${falsePositives}}`}
            </div>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-200/90 leading-relaxed">
            <span className="font-bold block mb-1">💡 贝叶斯核心智慧：</span>
            {scenario.explanation}
          </div>
        </div>
      </div>
    </div>
  );
};
