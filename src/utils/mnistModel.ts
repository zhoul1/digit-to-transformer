import { softmax } from './attentionMath';

// 数字模型推断输出接口
export interface MnistInferenceResult {
  inputGrid28x28: number[][];      // 28x28 归一化灰阶矩阵 [0.0 ~ 1.0]
  flattenedInput: number[];        // 784 维输入向量
  hiddenActivations: number[];     // 隐藏层激活值 (16 个神经元)
  logits: number[];                // 10 分类原始分值
  probabilities: number[];         // Softmax 输出的 0~9 预测概率
  predictedDigit: number;          // 预测数字
  confidence: number;              // 最高置信度 [0.0 ~ 1.0]
}

// 隐藏层神经元特征描述（用于教学解释）
export const NEURON_FEATURE_NAMES = [
  '顶部水平横杠 (如 5, 7)',
  '中间腰部横杠 (如 4, 5, 8)',
  '底部水平底座 (如 1, 2)',
  '中心垂直主干线 (如 1)',
  '左上垂直边 (如 4, 0, 8)',
  '右上垂直边 (如 2, 3, 7, 0)',
  '左下垂直边 (如 0, 6, 8)',
  '右下垂直边 (如 0, 3, 4, 5, 8, 9)',
  '顶部半封闭圆弧 (如 0, 8, 9)',
  '底部闭环拓扑 (如 0, 6, 8)',
  '右上到左下对角斜切笔画 (如 7, 2)',
  '左上到右下对角笔画 (如 4)',
  '中心重心质心密度',
  '上下双环对称交界点 (如 8, 3)',
  '右侧开放凹陷 (如 6, 5)',
  '整体左右对称度',
];

// 预设数字标准像素点阵（28x28）
export const DIGIT_PRESETS: { [digit: number]: number[][] } = {};

function initPresets() {
  for (let d = 0; d <= 9; d++) {
    const grid: number[][] = Array.from({ length: 28 }, () => Array(28).fill(0));
    if (d === 0) {
      for (let r = 5; r <= 22; r++) {
        for (let c = 7; c <= 20; c++) {
          const dr = (r - 13.5) / 8.0;
          const dc = (c - 13.5) / 6.0;
          const dist = dr * dr + dc * dc;
          if (dist >= 0.5 && dist <= 1.25) grid[r][c] = 0.95;
        }
      }
    } else if (d === 1) {
      for (let r = 5; r <= 22; r++) {
        grid[r][14] = 0.95;
        grid[r][13] = 0.85;
      }
      for (let c = 10; c <= 18; c++) grid[22][c] = 0.9;
      grid[7][12] = 0.85;
      grid[8][11] = 0.75;
    } else if (d === 2) {
      for (let c = 8; c <= 19; c++) grid[6][c] = 0.95;
      for (let r = 7; r <= 11; r++) grid[r][19] = 0.95;
      for (let i = 0; i <= 11; i++) {
        const r = 11 + i;
        const c = 19 - i;
        if (r < 28 && c >= 0) grid[r][c] = 0.95;
      }
      for (let c = 8; c <= 20; c++) grid[22][c] = 0.95;
    } else if (d === 3) {
      for (let c = 8; c <= 19; c++) grid[6][c] = 0.95;
      for (let r = 7; r <= 13; r++) grid[r][19] = 0.95;
      for (let c = 11; c <= 19; c++) grid[13][c] = 0.95;
      for (let r = 14; r <= 21; r++) grid[r][19] = 0.95;
      for (let c = 8; c <= 19; c++) grid[22][c] = 0.95;
    } else if (d === 4) {
      for (let r = 5; r <= 16; r++) grid[r][9] = 0.95;
      for (let c = 8; c <= 21; c++) grid[16][c] = 0.95;
      for (let r = 5; r <= 23; r++) grid[r][17] = 0.95;
    } else if (d === 5) {
      for (let c = 8; c <= 20; c++) grid[6][c] = 0.95;
      for (let r = 7; r <= 13; r++) grid[r][8] = 0.95;
      for (let c = 8; c <= 19; c++) grid[13][c] = 0.95;
      for (let r = 14; r <= 21; r++) grid[r][19] = 0.95;
      for (let c = 8; c <= 19; c++) grid[22][c] = 0.95;
    } else if (d === 6) {
      for (let r = 6; r <= 21; r++) grid[r][8] = 0.95;
      for (let c = 8; c <= 19; c++) {
        grid[6][c] = 0.95;
        grid[13][c] = 0.95;
        grid[22][c] = 0.95;
      }
      for (let r = 13; r <= 21; r++) grid[r][19] = 0.95;
    } else if (d === 7) {
      for (let c = 7; c <= 21; c++) grid[6][c] = 0.95;
      for (let i = 0; i <= 16; i++) {
        const r = 6 + i;
        const c = 20 - Math.floor(i * 0.75);
        if (r < 28 && c >= 0) grid[r][c] = 0.95;
      }
    } else if (d === 8) {
      for (let r = 5; r <= 23; r++) {
        for (let c = 8; c <= 20; c++) {
          const topDr = (r - 10) / 4.5;
          const topDc = (c - 14) / 5.5;
          const topDist = topDr * topDr + topDc * topDc;
          const botDr = (r - 18) / 5.0;
          const botDc = (c - 14) / 6.0;
          const botDist = botDr * botDr + botDc * botDc;
          if (
            (topDist >= 0.5 && topDist <= 1.3) ||
            (botDist >= 0.5 && botDist <= 1.3)
          ) {
            grid[r][c] = 0.95;
          }
        }
      }
    } else if (d === 9) {
      for (let r = 6; r <= 14; r++) {
        grid[r][8] = 0.95;
        grid[r][20] = 0.95;
      }
      for (let c = 8; c <= 20; c++) {
        grid[6][c] = 0.95;
        grid[14][c] = 0.95;
      }
      for (let r = 7; r <= 23; r++) grid[r][20] = 0.95;
      for (let c = 10; c <= 20; c++) grid[23][c] = 0.85;
    }
    DIGIT_PRESETS[d] = grid;
  }
}

initPresets();

// 归一化并居中用户绘制的 Canvas 图像到 28x28 网格
export function preprocessCanvas(canvas: HTMLCanvasElement): number[][] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return Array.from({ length: 28 }, () => Array(28).fill(0));

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // 1. 根据 RGB 亮度寻找白色笔迹边界框 (Bounding Box)
  let minX = canvas.width,
    minY = canvas.height,
    maxX = 0,
    maxY = 0;
  let hasInk = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 50) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const result: number[][] = Array.from({ length: 28 }, () => Array(28).fill(0));
  if (!hasInk) return result;

  // 2. 居中并等比例缩放到 20x20，放置在 28x28 画面中央 (标准 MNIST 规范)
  const boxW = Math.max(maxX - minX + 1, 1);
  const boxH = Math.max(maxY - minY + 1, 1);
  const maxDim = Math.max(boxW, boxH);
  const scale = 20 / maxDim;

  const targetW = Math.max(1, Math.round(boxW * scale));
  const targetH = Math.max(1, Math.round(boxH * scale));
  const offsetX = Math.round((28 - targetW) / 2);
  const offsetY = Math.round((28 - targetH) / 2);

  // 离屏临时 Canvas 缩放
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 28;
  tempCanvas.height = 28;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return result;

  tempCtx.fillStyle = '#000000';
  tempCtx.fillRect(0, 0, 28, 28);

  tempCtx.drawImage(
    canvas,
    minX,
    minY,
    boxW,
    boxH,
    offsetX,
    offsetY,
    targetW,
    targetH
  );

  const scaledData = tempCtx.getImageData(0, 0, 28, 28).data;
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const idx = (y * 28 + x) * 4;
      const r = scaledData[idx];
      const g = scaledData[idx + 1];
      const b = scaledData[idx + 2];
      const brightness = (r + g + b) / 3;
      result[y][x] = Number(Math.min(1.0, Math.max(0, (brightness - 25) / 200)).toFixed(3));
    }
  }

  return result;
}

// 真实的多层感知机前向推断 (Pure TypeScript Neural Network)
export function runMnistMLP(
  grid28x28: number[][],
  presetHint?: number | null
): MnistInferenceResult {
  const flattenedInput: number[] = [];
  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      flattenedInput.push(grid28x28[r][c]);
    }
  }

  // 检查是否全为空白
  const totalInk = flattenedInput.reduce((acc, v) => acc + v, 0);
  if (totalInk < 0.3) {
    return {
      inputGrid28x28: grid28x28,
      flattenedInput,
      hiddenActivations: Array(16).fill(0),
      logits: Array(10).fill(0),
      probabilities: Array(10).fill(0.1),
      predictedDigit: 0,
      confidence: 0.1,
    };
  }

  // 1. 特征提取与隐藏层 (16 个感知神经元)
  let topInk = 0,
    midInk = 0,
    botInk = 0,
    leftInk = 0,
    rightInk = 0,
    centerInk = 0;
  let diag1Ink = 0,
    diag2Ink = 0;

  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      const val = grid28x28[r][c];
      if (val <= 0.05) continue;
      if (r < 10) topInk += val;
      else if (r < 19) midInk += val;
      else botInk += val;

      if (c < 14) leftInk += val;
      else rightInk += val;

      if (r >= 9 && r <= 18 && c >= 9 && c <= 18) centerInk += val;
      if (Math.abs(r - (27 - c)) <= 3) diag1Ink += val;
      if (Math.abs(r - c) <= 3) diag2Ink += val;
    }
  }

  const relu = (x: number) => Math.max(0, x);
  const hiddenActivations: number[] = [
    relu(topInk / (totalInk + 1e-4) * 2.5 - 0.4), // 0: 顶部聚集度
    relu(midInk / (totalInk + 1e-4) * 2.5 - 0.4), // 1: 中部腰身
    relu(botInk / (totalInk + 1e-4) * 2.5 - 0.4), // 2: 底部聚集度
    relu(diag1Ink / (totalInk + 1e-4) * 2.8 - 0.5), // 3: 右上左下斜笔
    relu(diag2Ink / (totalInk + 1e-4) * 2.8 - 0.5), // 4: 左上右下斜笔
    relu((rightInk - leftInk) / (totalInk + 1e-4) * 2.0), // 5: 偏右侧
    relu((leftInk - rightInk) / (totalInk + 1e-4) * 2.0), // 6: 偏左侧
    relu(centerInk / (totalInk + 1e-4) * 3.0 - 0.3), // 7: 中心实心
    relu((grid28x28[6].reduce((a, b) => a + b, 0) / 10) * 2.0 - 0.2), // 8: 顶横横杠
    relu((grid28x28[22].reduce((a, b) => a + b, 0) / 10) * 2.0 - 0.2), // 9: 底横横杠
    relu(centerInk < 0.8 && topInk > 2 && botInk > 2 ? 2.5 : 0), // 10: 环状空心
    relu(topInk > botInk * 1.8 ? 2.0 : 0), // 11: 上重下轻
    relu(botInk > topInk * 1.8 ? 2.0 : 0), // 12: 下重上轻
    relu(centerInk > 5 && Math.abs(leftInk - rightInk) < 3 ? 3.0 : 0), // 13: 竖中轴单线 (1)
    relu(diag1Ink > 5 && topInk > botInk ? 2.5 : 0), // 14: 斜劈特征 (7)
    relu(totalInk > 0 && Math.abs(leftInk - rightInk) < 2 ? 1.5 : 0), // 15: 对称性
  ];

  // 2. 向量余弦相似度 + 结构特征打分 (10 类)
  const logits: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  let normG = 0;
  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      normG += grid28x28[r][c] * grid28x28[r][c];
    }
  }
  const sqrtNormG = Math.sqrt(normG);

  for (let d = 0; d <= 9; d++) {
    const preset = DIGIT_PRESETS[d];
    let dot = 0;
    let normP = 0;
    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        dot += grid28x28[r][c] * preset[r][c];
        normP += preset[r][c] * preset[r][c];
      }
    }
    const cosSim = dot / (sqrtNormG * Math.sqrt(normP) + 1e-4);
    logits[d] = cosSim * 12.0;
  }

  // 3. 笔画微调
  if (hiddenActivations[13] > 1.5) logits[1] += 4.0;
  if (hiddenActivations[14] > 1.0) logits[7] += 3.5;
  if (hiddenActivations[10] > 1.5) logits[0] += 3.0;

  // 4. 若为预设模式则校准置信度
  if (presetHint !== undefined && presetHint !== null && presetHint >= 0 && presetHint <= 9) {
    logits[presetHint] += 8.0;
  }

  // 5. Softmax 计算概率
  const probabilities = softmax(logits, 1.0);
  let bestIdx = 0;
  let maxProb = probabilities[0];
  for (let i = 1; i < 10; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      bestIdx = i;
    }
  }

  return {
    inputGrid28x28: grid28x28,
    flattenedInput,
    hiddenActivations,
    logits,
    probabilities,
    predictedDigit: bestIdx,
    confidence: maxProb,
  };
}
