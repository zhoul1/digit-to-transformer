import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">
            {filename || (language === 'python' ? 'script.py' : 'code.ts')}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-bold">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 transition-all cursor-pointer text-xs"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">已复制!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制代码</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-300">
        <table className="table w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="table-cell pr-4 text-right select-none text-slate-600 w-8 border-r border-slate-800/60 font-mono text-xs">
                  {idx + 1}
                </td>
                <td className="table-cell pl-4 whitespace-pre font-mono">
                  {/* 简单的高亮染色：注释、关键字、函数 */}
                  {highlightSyntax(line, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 极轻量语法高亮模拟
function highlightSyntax(line: string, _lang: string) {
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-emerald-400 italic">{line}</span>;
  }

  // 区分关键词
  const keywords = ['import', 'from', 'def', 'class', 'return', 'if', 'else', 'for', 'in', 'as', 'function', 'const', 'let', 'var', 'await', 'async'];
  const parts = line.split(/(\s+|[(),.:=+\-*/[\]{}])/);

  return (
    <span>
      {parts.map((part, i) => {
        if (keywords.includes(part)) {
          return <span key={i} className="text-pink-400 font-semibold">{part}</span>;
        }
        if (part === 'torch' || part === 'nn' || part === 'F' || part === 'Math') {
          return <span key={i} className="text-cyan-400 font-medium">{part}</span>;
        }
        if (part === 'self') {
          return <span key={i} className="text-purple-400 italic">{part}</span>;
        }
        if (/^".*"$/.test(part) || /^'.*'$/.test(part)) {
          return <span key={i} className="text-amber-300">{part}</span>;
        }
        if (/^\d+(\.\d+)?$/.test(part)) {
          return <span key={i} className="text-orange-400">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
