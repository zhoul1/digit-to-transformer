import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { PYTORCH_SNIPPETS, PyTorchSnippet } from '../../data/pytorchCodeData';
import { CodeBlock } from '../common/CodeBlock';

export const PyTorchHubPlayground: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState<PyTorchSnippet>(
    PYTORCH_SNIPPETS[0]
  );
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([selectedSnippet.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedSnippet.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 顶部介绍 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Terminal className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                PyTorch 官方规范完整实战教学代码库
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              包含从手写数字识别 MLP、多头自注意力机制 (Multi-Head Attention) 到完整 GPT 自回归生成器的端到端可运行 Python 源码，附赠详尽张量形状 (Tensor Shape) 导航。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-xs text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制源码' : '复制整份代码'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .py 脚本</span>
            </button>
          </div>
        </div>

        {/* 脚本选项卡 */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          {PYTORCH_SNIPPETS.map((snip) => (
            <button
              key={snip.id}
              onClick={() => setSelectedSnippet(snip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedSnippet.id === snip.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{snip.filename}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 核心内容区 */}
      <div className="space-y-4">
        {/* 脚本说明与张量维度速查卡 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base">
              {selectedSnippet.title}
            </h3>
            <div className="flex gap-1.5">
              {selectedSnippet.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {selectedSnippet.description}
          </p>

          {/* 张量维度速查表格 */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>核心张量维度 (Tensor Shapes) 透视表：</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-1.5 pr-4">张量名称</th>
                    <th className="py-1.5 pr-4 font-mono">数学形状 (Shape)</th>
                    <th className="py-1.5">物理/语义含义</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {selectedSnippet.shapeExplanation.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2 pr-4 font-mono text-slate-200 font-semibold">
                        {row.tensor}
                      </td>
                      <td className="py-2 pr-4 font-mono text-indigo-400">
                        {row.shape}
                      </td>
                      <td className="py-2 text-slate-300">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 源码阅读器 */}
        <CodeBlock
          code={selectedSnippet.code}
          language="python"
          filename={selectedSnippet.filename}
        />
      </div>
    </div>
  );
};
