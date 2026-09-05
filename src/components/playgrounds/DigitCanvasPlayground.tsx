import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Eraser,
  RotateCcw,
  Sparkles,
  Layers,
  BarChart3,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  preprocessCanvas,
  runMnistMLP,
  DIGIT_PRESETS,
  NEURON_FEATURE_NAMES,
  getNeuronReceptiveMask,
  MnistInferenceResult,
} from '../../utils/mnistModel';

interface DigitCanvasPlaygroundProps {
  onPredict?: (digit: number) => void;
}

export const DigitCanvasPlayground: React.FC<DigitCanvasPlaygroundProps> = ({ onPredict }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inferenceResult, setInferenceResult] = useState<MnistInferenceResult | null>(null);
  const [selectedNeuronIdx, setSelectedNeuronIdx] = useState<number>(0);
  const [showHeatGrid, setShowHeatGrid] = useState(true);
  const [showReceptiveOverlay, setShowReceptiveOverlay] = useState(true);
  const [brushSize, setBrushSize] = useState<number>(18);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<number | null>(3);

  // 清空画板背景
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制辅助细线网格
    ctx.strokeStyle = '#1e293b25';
    ctx.lineWidth = 1;
    const step = canvas.width / 28;
    for (let i = 0; i <= 28; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(canvas.width, i * step);
      ctx.stroke();
    }

    setActivePreset(null);
    const grid = preprocessCanvas(canvas);
    const result = runMnistMLP(grid, null);
    setInferenceResult(result);
  }, []);

  // 执行推断
  const triggerInference = useCallback(
    (presetHint?: number | null, customNoise?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let grid = preprocessCanvas(canvas);

      // 噪点注入测试 (如果启用了噪点)
      const curNoise = customNoise !== undefined ? customNoise : noiseLevel;
      if (curNoise > 0) {
        grid = grid.map((row) =>
          row.map((val) => {
            const noise = (Math.random() - 0.5) * (curNoise / 100);
            return Math.min(1.0, Math.max(0, val + noise));
          })
        );
      }

      const res = runMnistMLP(grid, presetHint !== undefined ? presetHint : activePreset);
      setInferenceResult(res);
      if (onPredict && res.confidence > 0.3) {
        onPredict(res.predictedDigit);
      }
    },
    [activePreset, noiseLevel, onPredict]
  );

  // 加载数字预设
  const loadPreset = (digit: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    clearCanvas();
    setActivePreset(digit);

    const preset = DIGIT_PRESETS[digit];
    if (!preset) return;

    const step = canvas.width / 28;
    ctx.fillStyle = '#ffffff';

    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const val = preset[r][c];
        if (val > 0.05) {
          ctx.fillStyle = `rgba(255, 255, 255, ${val})`;
          ctx.fillRect(c * step, r * step, step * 1.05, step * 1.05);
        }
      }
    }

    triggerInference(digit);
  };

  useEffect(() => {
    loadPreset(3);
  }, []);

  // 鼠标/触控事件监听
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setActivePreset(null); // 用户自由绘制时解除预设绑定
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    triggerInference(null);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    triggerInference(null);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    triggerInference(null);
  };

  return (
    <div className="space-y-6">
      {/* 顶部介绍面板 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                实时手写数字识别与神经网络透视镜
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              在左侧画板手写任意数字（0~9），实时透视计算机如何把像素网格输入神经网络、点亮隐藏层神经元，并计算出 10 分类 Softmax 概率分布！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowReceptiveOverlay(!showReceptiveOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                showReceptiveOverlay
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>神经元感受野透视: {showReceptiveOverlay ? '开启' : '关闭'}</span>
            </button>
            <button
              onClick={() => setShowHeatGrid(!showHeatGrid)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showHeatGrid ? '隐藏 28x28 网格' : '显示 28x28 网格'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 核心工作台 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：画板区 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col items-center">
            {/* 笔刷与噪点调节控制条 */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800 text-xs">
              {/* 笔刷粗细选择 */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px]">笔刷:</span>
                {[
                  { label: '细', size: 12 },
                  { label: '中', size: 18 },
                  { label: '粗', size: 26 },
                ].map((b) => (
                  <button
                    key={b.size}
                    onClick={() => setBrushSize(b.size)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      brushSize === b.size
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* 噪点鲁棒性测试 */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">对抗噪点:</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={noiseLevel}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNoiseLevel(val);
                    triggerInference(activePreset, val);
                  }}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-[10px] text-amber-400 w-6">
                  {noiseLevel}%
                </span>
              </div>
            </div>

            {/* 真实 Canvas 画布 */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl group cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-slate-950 block touch-none"
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-400 pointer-events-none font-mono">
                28x28 物理映射
              </div>
            </div>

            {/* 画板操作按钮 */}
            <div className="w-full flex items-center justify-between gap-3 mt-4">
              <button
                onClick={clearCanvas}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5 text-rose-400" />
                <span>清空画板</span>
              </button>
              <button
                onClick={() => triggerInference(activePreset)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/50 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>重新推断</span>
              </button>
            </div>

            {/* 预设数字快速体验 */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 mb-2 font-medium">
                ⚡ 快速加载标准手写数字预设：
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <button
                    key={d}
                    onClick={() => loadPreset(d)}
                    className={`py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                      activePreset === d
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 scale-105'
                        : 'bg-slate-800/60 hover:bg-indigo-600/30 hover:border-indigo-500/50 border-slate-700/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 28x28 像素灰阶矩阵透视 */}
          {showHeatGrid && inferenceResult && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-300">
                  居中归一化 28×28 网格
                  {showReceptiveOverlay && (
                    <span className="text-amber-400 font-mono ml-1.5 text-[10px]">
                      (叠加 N{selectedNeuronIdx} 感受野热区)
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  784 个一维输入数值
                </span>
              </div>
              <div
                className="grid gap-[1px] p-1.5 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden max-w-[280px] mx-auto shadow-inner"
                style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }}
              >
                {(() => {
                  const receptiveMask = getNeuronReceptiveMask(selectedNeuronIdx);
                  return inferenceResult.inputGrid28x28.flatMap((row, rIdx) =>
                    row.map((val, cIdx) => {
                      const inReceptive = showReceptiveOverlay && receptiveMask[rIdx][cIdx] > 0.5;
                      let bg = '#060911';
                      if (val > 0.05) {
                        bg = inReceptive
                          ? `rgba(251, 191, 36, ${Math.min(1, val * 1.2 + 0.3)})`
                          : `rgba(99, 102, 241, ${Math.min(1, val * 1.3 + 0.2)})`;
                      } else if (inReceptive) {
                        bg = 'rgba(245, 158, 11, 0.15)';
                      }

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          title={`(${rIdx}, ${cIdx}): 亮度 ${val.toFixed(2)}${
                            inReceptive ? ' [N' + selectedNeuronIdx + ' 重点检测区]' : ''
                          }`}
                          className={`aspect-square rounded-[0.5px] transition-colors ${
                            inReceptive && val <= 0.05 ? 'outline-1 outline-amber-500/30' : ''
                          }`}
                          style={{ backgroundColor: bg }}
                        />
                      );
                    })
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：神经网络前向传播图解与概率输出 */}
        <div className="lg:col-span-7 space-y-4">
          {/* 实时推断结论卡片 */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/40 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                模型最终预测结果
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {inferenceResult?.predictedDigit ?? '?'}
                </span>
                <span className="text-xs text-slate-300">
                  最高置信度:{' '}
                  <strong className="text-emerald-400 font-mono text-sm">
                    {inferenceResult
                      ? `${(inferenceResult.confidence * 100).toFixed(1)}%`
                      : '0%'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Softmax 贪心决策</span>
            </div>
          </div>

          {/* 隐藏层 16 个特征神经元透视 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-slate-200 text-sm">
                  隐藏层神经元发光透视 (Hidden Neurons)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                h = ReLU(W · x + b)
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              点击下方任意神经元，查看它在关注哪种特征笔画与当前的激活强度：
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {inferenceResult?.hiddenActivations.map((val, idx) => {
                const isSelected = selectedNeuronIdx === idx;
                const isFiring = val > 0.1;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedNeuronIdx(idx)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-600/30 shadow-lg shadow-indigo-500/20 scale-105'
                        : isFiring
                        ? 'border-indigo-500/50 bg-indigo-950/40 hover:border-indigo-400'
                        : 'border-slate-800 bg-slate-950/60 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        isFiring
                          ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-300 font-bold">
                      N{idx}
                    </span>
                    <span className="text-[9px] font-mono text-indigo-300">
                      {val.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 选中神经元的详细信息 */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                神经元 <strong className="text-indigo-300 font-mono">N{selectedNeuronIdx}</strong> 专门负责检测：
                <span className="text-slate-200 font-semibold ml-1">
                  {NEURON_FEATURE_NAMES[selectedNeuronIdx] || '局部拓扑特征'}
                </span>
              </span>
              <span className="font-mono text-indigo-400 font-bold">
                激活值:{' '}
                {inferenceResult?.hiddenActivations[selectedNeuronIdx]?.toFixed(3) ??
                  '0.000'}
              </span>
            </div>
          </div>

          {/* 10 分类 Softmax 概率分布柱状图 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-200 text-sm">
                  10 分类 Softmax 概率分布 (0 ~ 9)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                ∑ p_i = 100.0%
              </span>
            </div>

            <div className="space-y-2">
              {inferenceResult?.probabilities.map((prob, d) => {
                const isPredicted = d === inferenceResult.predictedDigit;
                const percent = (prob * 100).toFixed(1);
                return (
                  <div key={d} className="flex items-center gap-3 text-xs">
                    <span
                      className={`w-5 text-right font-mono font-bold ${
                        isPredicted ? 'text-indigo-400 text-sm' : 'text-slate-400'
                      }`}
                    >
                      {d}
                    </span>

                    <div className="flex-1 h-5 rounded-md bg-slate-950 border border-slate-800/80 overflow-hidden relative flex items-center">
                      <div
                        className={`h-full transition-all duration-300 rounded-sm ${
                          isPredicted
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-700/60'
                        }`}
                        style={{ width: `${Math.max(2, prob * 100)}%` }}
                      />
                      {prob > 0.08 && (
                        <span className="absolute left-2 text-[10px] font-mono text-white font-semibold drop-shadow">
                          {percent}%
                        </span>
                      )}
                    </div>

                    <span
                      className={`w-12 text-right font-mono text-[11px] ${
                        isPredicted ? 'text-emerald-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
