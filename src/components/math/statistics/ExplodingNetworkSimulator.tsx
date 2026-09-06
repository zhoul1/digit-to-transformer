import React, { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Activity, Layers, RefreshCw } from 'lucide-react';

interface LayerState {
  layerIndex: number;
  name: string;
  mean: number;
  variance: number;
  minVal: number;
  maxVal: number;
  hasNaN: boolean;
  sampleVector: number[];
}

export const ExplodingNetworkSimulator: React.FC = () => {
  const [layerNormEnabled, setLayerNormEnabled] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(1);

  // 模拟 12 层前向传播
  const layers: LayerState[] = useMemo(() => {
    const list: LayerState[] = [];
    const numLayers = 12;
    const dim = 8; // 每个隐藏向量 8 个维度

    // 初始输入向量
    let currentVector = [1.2, -0.8, 0.5, 1.5, -1.1, 0.3, -0.4, 0.9];

    for (let l = 1; l <= numLayers; l++) {
      // 模拟权重矩阵全连接与残差累加
      // 每个权重采样自 N(0, 1.35) 具有微小的方差放大趋势
      const nextVector: number[] = [];
      let isExploded = false;

      for (let d = 0; d < dim; d++) {
        let sum = currentVector[d]; // 残差连接 Residual Add
        // 模拟全连接层变换
        const pseudoWeight = Math.sin(l * 13 + d * 7 + seed) * 1.6 + 0.3;
        sum += currentVector[(d + 1) % dim] * pseudoWeight;

        // 非线性微调
        if (sum > 0) sum *= 1.1;

        if (!isFinite(sum) || Math.abs(sum) > 1e7) {
          isExploded = true;
          sum = NaN;
        }
        nextVector.push(sum);
      }

      // 如果开启 LayerNorm，在每层末尾强制执行均值归 0、方差归 1
      if (layerNormEnabled && !isExploded) {
        const m = nextVector.reduce((a, b) => a + b, 0) / dim;
        const v = nextVector.reduce((a, b) => a + Math.pow(b - m, 2), 0) / dim;
        const s = Math.sqrt(v + 1e-5);
        for (let d = 0; d < dim; d++) {
          nextVector[d] = (nextVector[d] - m) / s;
        }
      }

      currentVector = nextVector;

      // 统计本层指标
      const valid = currentVector.filter((x) => !isNaN(x));
      const hasNaN = valid.length < dim;
      let mean = 0;
      let variance = 0;
      let minVal = 0;
      let maxVal = 0;

      if (valid.length > 0) {
        mean = valid.reduce((a, b) => a + b, 0) / valid.length;
        variance = valid.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / valid.length;
        minVal = Math.min(...valid);
        maxVal = Math.max(...valid);
      }

      list.push({
        layerIndex: l,
        name: `Layer ${l}`,
        mean,
        variance,
        minVal,
        maxVal,
        hasNaN,
        sampleVector: [...currentVector],
      });
    }

    return list;
  }, [layerNormEnabled, seed]);

  const finalLayer = layers[layers.length - 1];
  const isCrashed = finalLayer.hasNaN || Math.abs(finalLayer.maxVal) > 1000;

  return (
    <div className="bg-[#0b101b] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题与总开关 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              💥 灾难对照舱 04
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              12 层 Transformer 激活值爆炸灾难模拟器
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            <strong>真实工程震撼</strong>：为什么大模型不能像初中数学那样直接乘矩阵？
            亲手关掉 LayerNorm，看深层网络如何在 8 层内彻底沦为溢出垃圾！
          </p>
        </div>

        {/* 核心生死闸门开关 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLayerNormEnabled(!layerNormEnabled)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-xl cursor-pointer ${
              layerNormEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50 animate-pulse'
            }`}
          >
            {layerNormEnabled ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>🛡️ LayerNorm 已开启 (平稳守护)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>🔥 裸奔模式：LayerNorm 已关闭！</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSeed((s) => s + 1)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="更换随机输入"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 灾难警报横幅 */}
      {isCrashed ? (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 flex items-center gap-3 text-rose-300 animate-pulse">
          <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400" />
          <div>
            <div className="font-black text-sm text-rose-200">💥 紧急警报：模型激活值发生指数级爆炸溢出 (NaN)！</div>
            <div className="text-xs text-rose-300/80 mt-0.5">
              没有 LayerNorm 的束缚，深层残差网络误差在逐层传递中被无休止放大。到第 12 层时，参数全变成了 NaN
              (Not a Number)，数十万美元训练费用瞬间打水漂！
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <div className="text-xs text-emerald-200">
            <strong>✅ 完美平稳</strong>：LayerNorm 在每一层末尾强制拉回 $\mu=0, \sigma^2=1$，信号在 12 层间平滑流通，千亿参数大模型得以稳定迭代！
          </div>
        </div>
      )}

      {/* 12 层逐层健康状态矩阵 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {layers.map((l) => {
          const isDanger = l.hasNaN || Math.abs(l.maxVal) > 50;
          const isWarning = !isDanger && Math.abs(l.maxVal) > 6;

          return (
            <div
              key={l.layerIndex}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                isDanger
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-500/10'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{l.name}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isDanger ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              </div>

              {/* 微型直方条 */}
              <div className="h-10 bg-slate-950/80 rounded-lg border border-slate-800 p-1 flex items-end justify-between gap-1 overflow-hidden">
                {l.sampleVector.map((val, d) => {
                  const h = isNaN(val) ? 100 : Math.min(100, Math.max(10, (Math.abs(val) / 4) * 100));
                  return (
                    <div
                      key={d}
                      style={{ height: `${h}%` }}
                      className={`flex-1 rounded-sm ${
                        isNaN(val)
                          ? 'bg-rose-500'
                          : Math.abs(val) > 10
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  );
                })}
              </div>

              {/* 数值指标 */}
              <div className="text-[10px] space-y-0.5 font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                <div className="flex justify-between">
                  <span>均值 μ:</span>
                  <span className={l.hasNaN ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {l.hasNaN ? 'NaN' : l.mean.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>方差 σ²:</span>
                  <span className={l.hasNaN ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {l.hasNaN ? 'NaN' : l.variance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 极简人话总结 */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-1">
        <span className="font-bold text-amber-300 block mb-1">💡 降压药隐喻：</span>
        如果不做层归一化，大模型的数值漂移就像血压飙升：第 1 层 120/80，第 4 层 180/120，第 8 层血管破裂脑溢血。
        <strong>LayerNorm 就是每一个网络神经元节点上的“自动血压调节阀”</strong>，强制将均值置 0、方差置 1，这才是 Transformer 能够堆叠 96 层依然平稳运行的生命线！
      </div>
    </div>
  );
};
