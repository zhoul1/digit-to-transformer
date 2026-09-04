// 数学工具库：自注意力与矩阵运算

// 1. 向量点积
export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * (b[i] || 0);
  }
  return sum;
}

// 2. 带有温度系数与数值稳定性的 Softmax
export function softmax(logits: number[], temperature = 1.0): number[] {
  if (logits.length === 0) return [];
  const temp = Math.max(temperature, 1e-4);
  const scaled = logits.map((x) => x / temp);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map((x) => Math.exp(x - maxVal));
  const sumExps = exps.reduce((acc, v) => acc + v, 0);
  return exps.map((v) => (sumExps > 0 ? v / sumExps : 1 / logits.length));
}

// 3. 矩阵乘法 [M, K] x [K, N] -> [M, N]
export function matMul(A: number[][], B: number[][]): number[][] {
  const M = A.length;
  const K = A[0].length;
  const N = B[0].length;
  const result: number[][] = Array.from({ length: M }, () => Array(N).fill(0));

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      let sum = 0;
      for (let k = 0; k < K; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

// 4. 矩阵转置
export function transpose(matrix: number[][]): number[][] {
  const M = matrix.length;
  const N = matrix[0].length;
  const result: number[][] = Array.from({ length: N }, () => Array(M).fill(0));
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

// 5. 缩放点积自注意力计算
export interface ScaledDotProductResult {
  scoresRaw: number[][];       // Q * K^T
  scoresScaled: number[][];    // Q * K^T / sqrt(d_k)
  scoresMasked: number[][];    // 掩码后的分值
  attentionWeights: number[][]; // Softmax 后的注意力权重矩阵 (NxN)
  output: number[][];          // Weights * V
}

export function computeScaledDotProductAttention(
  Q: number[][],
  K: number[][],
  V: number[][],
  useCausalMask = true,
  temperature = 1.0
): ScaledDotProductResult {
  const seqLen = Q.length;
  const d_k = Q[0].length;
  const sqrtDk = Math.sqrt(d_k);

  // 1. Raw scores: Q * K^T
  const Kt = transpose(K);
  const scoresRaw = matMul(Q, Kt);

  // 2. Scaled scores: divide by sqrt(d_k)
  const scoresScaled: number[][] = scoresRaw.map((row) =>
    row.map((val) => Number((val / sqrtDk).toFixed(4)))
  );

  // 3. Apply Causal Mask (if enabled, upper triangle gets -Infinity)
  const scoresMasked: number[][] = scoresScaled.map((row, i) =>
    row.map((val, j) => {
      if (useCausalMask && j > i) {
        return -1e9; // 表示负无穷
      }
      return val;
    })
  );

  // 4. Softmax per row
  const attentionWeights: number[][] = scoresMasked.map((row) =>
    softmax(row, temperature)
  );

  // 5. Context output: AttentionWeights * V
  const output = matMul(attentionWeights, V);

  return {
    scoresRaw,
    scoresScaled,
    scoresMasked,
    attentionWeights,
    output,
  };
}

// 6. 生成标准正弦/余弦位置编码 (Sinusoidal Positional Encoding)
export function generateSinusoidalPE(seqLen: number, dModel: number): number[][] {
  const pe: number[][] = [];
  for (let pos = 0; pos < seqLen; pos++) {
    const row: number[] = [];
    for (let i = 0; i < dModel; i++) {
      if (i % 2 === 0) {
        row.push(Math.sin(pos / Math.pow(10000, i / dModel)));
      } else {
        row.push(Math.cos(pos / Math.pow(10000, (i - 1) / dModel)));
      }
    }
    pe.push(row);
  }
  return pe;
}
