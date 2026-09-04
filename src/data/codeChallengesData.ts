import { CodeChallenge } from '../types';

export const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: 'challenge-softmax',
    title: '挑战 1：实现数值稳定的 Softmax 函数',
    difficulty: '入门',
    category: '基础数学与分类',
    description:
      '请实现一个接收一维数字数组 `logits` 并返回概率分布数组的函数。要求注意**数值稳定性**：先减去数组中的最大值，防止 `Math.exp` 发生上溢 (Overflow) 产生 NaN。输出的概率之和应为 1.0。',
    starterCode: `function softmax(logits) {
  // 提示：
  // 1. 找出 logits 中的最大值 maxVal
  // 2. 计算每个元素减去 maxVal 后的 exp(x - maxVal)
  // 3. 对所有 exp 值求和 sumExp
  // 4. 返回每个 exp 值除以 sumExp 的数组
  
  // 请在此处编写你的代码：
  
}
`,
    solutionCode: `function softmax(logits) {
  if (!logits || logits.length === 0) return [];
  const maxVal = Math.max(...logits);
  const exps = logits.map(x => Math.exp(x - maxVal));
  const sumExp = exps.reduce((acc, v) => acc + v, 0);
  return exps.map(v => v / sumExp);
}`,
    testCases: [
      {
        inputName: '常规输入 [1.0, 2.0, 3.0]',
        description: '验证常规分值下的输出总和为 1 且单调递增',
        validate: (fn: any) => {
          try {
            const res = fn([1.0, 2.0, 3.0]);
            if (!Array.isArray(res) || res.length !== 3) {
              return { passed: false, message: '返回值必须是长度为 3 的数组' };
            }
            const sum = res.reduce((a: number, b: number) => a + b, 0);
            if (Math.abs(sum - 1.0) > 1e-4) {
              return { passed: false, message: `概率总和必须为 1.0，实际为 ${sum.toFixed(4)}` };
            }
            if (!(res[0] < res[1] && res[1] < res[2])) {
              return { passed: false, message: '输入越大，对应的概率应当越高' };
            }
            return { passed: true, message: `测试通过！输出: [${res.map((x: number) => x.toFixed(3)).join(', ')}]` };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
      {
        inputName: '大数防溢出 [1000, 1001, 1002]',
        description: '验证当 logits 极大时不会产生 NaN 或 Infinity',
        validate: (fn: any) => {
          try {
            const res = fn([1000, 1001, 1002]);
            if (!Array.isArray(res) || res.length !== 3) {
              return { passed: false, message: '返回值格式不符合要求' };
            }
            if (res.some((x: number) => isNaN(x) || !isFinite(x))) {
              return { passed: false, message: '检测到 NaN 或 Infinity！请务必先减去 maxVal 再进行 Math.exp' };
            }
            const sum = res.reduce((a: number, b: number) => a + b, 0);
            if (Math.abs(sum - 1.0) > 1e-4) {
              return { passed: false, message: `概率之和为 ${sum}` };
            }
            return { passed: true, message: `防溢出测试通过！输出: [${res.map((x: number) => x.toFixed(3)).join(', ')}]` };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
    ],
  },
  {
    id: 'challenge-attention',
    title: '挑战 2：计算缩放点积 (Scaled Dot Product)',
    difficulty: '核心',
    category: '自注意力机制',
    description:
      '请实现函数 `scaledDotProduct(q, k, d_k)`，接收两个长度相同的向量 `q` 和 `k`，以及特征维度 `d_k`。计算两者的内积（逐元素乘积之和），并除以 `Math.sqrt(d_k)`。',
    starterCode: `function scaledDotProduct(q, k, d_k) {
  // 提示：
  // 1. 点积 dot = q[0]*k[0] + q[1]*k[1] + ...
  // 2. 返回 dot / Math.sqrt(d_k)

  // 请在此处编写你的代码：
  
}
`,
    solutionCode: `function scaledDotProduct(q, k, d_k) {
  let dot = 0;
  for (let i = 0; i < q.length; i++) {
    dot += q[i] * k[i];
  }
  return dot / Math.sqrt(d_k);
}`,
    testCases: [
      {
        inputName: 'q=[1, 2], k=[3, 4], d_k=4',
        description: '点积为 1*3 + 2*4 = 11, sqrt(4) = 2, 结果应为 5.5',
        validate: (fn: any) => {
          try {
            const res = fn([1, 2], [3, 4], 4);
            if (Math.abs(res - 5.5) > 1e-4) {
              return { passed: false, message: `预期 5.5，实际返回 ${res}` };
            }
            return { passed: true, message: `测试通过！结果正确: ${res}` };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
      {
        inputName: '正交向量 q=[1, 0, 0], k=[0, 1, 0], d_k=3',
        description: '完全正交无关的两个向量点积应为 0',
        validate: (fn: any) => {
          try {
            const res = fn([1, 0, 0], [0, 1, 0], 3);
            if (Math.abs(res - 0) > 1e-4) {
              return { passed: false, message: `正交向量点积预期为 0，实际返回 ${res}` };
            }
            return { passed: true, message: '测试通过！正交向量相关度为 0' };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
    ],
  },
  {
    id: 'challenge-causal-mask',
    title: '挑战 3：构造因果下三角掩码 (Causal Mask)',
    difficulty: '进阶',
    category: 'Transformer 解码器',
    description:
      '请实现函数 `createCausalMask(seqLen)`，返回一个 `seqLen × seqLen` 的二维数组。对于位置 `(i, j)`，当 `j <= i` 时值为 `0`（表示可以看到该位置），当 `j > i` 时值为 `-Infinity`（表示遮蔽未来时刻的信息）。',
    starterCode: `function createCausalMask(seqLen) {
  // 提示：
  // 构造一个 seqLen 行 seqLen 列的二维数组
  // 当列索 j 大于行索引 i 时填充 -Infinity，否则填充 0

  // 请在此处编写你的代码：
  
}
`,
    solutionCode: `function createCausalMask(seqLen) {
  const mask = [];
  for (let i = 0; i < seqLen; i++) {
    const row = [];
    for (let j = 0; j < seqLen; j++) {
      row.push(j > i ? -Infinity : 0);
    }
    mask.push(row);
  }
  return mask;
}`,
    testCases: [
      {
        inputName: '序列长度 seqLen = 3',
        description: '应当生成 3x3 的下三角掩码矩阵',
        validate: (fn: any) => {
          try {
            const res = fn(3);
            if (!Array.isArray(res) || res.length !== 3 || res[0].length !== 3) {
              return { passed: false, message: '矩阵形状不符合 3x3 要求' };
            }
            // 检查 (0, 1), (0, 2), (1, 2) 是否为 -Infinity
            if (res[0][1] !== -Infinity || res[0][2] !== -Infinity || res[1][2] !== -Infinity) {
              return { passed: false, message: '右上角未来信息未被设为 -Infinity' };
            }
            // 检查对角线和下三角是否为 0
            if (res[0][0] !== 0 || res[1][0] !== 0 || res[1][1] !== 0 || res[2][0] !== 0) {
              return { passed: false, message: '对角线及左下角应当允许可见 (值为 0)' };
            }
            return { passed: true, message: '测试通过！3x3 因果掩码构建正确' };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
    ],
  },
  {
    id: 'challenge-temperature',
    title: '挑战 4：温度采样概率缩放 (Temperature Scaling)',
    difficulty: '进阶',
    category: '大模型生成控制',
    description:
      '请实现函数 `applyTemperature(logits, temperature)`。将每个原始 logit 除以 `temperature`，然后返回缩放并应用 Softmax 后的概率分布。若 temperature 极小，可平滑处理。',
    starterCode: `function applyTemperature(logits, temperature) {
  // 提示：
  // 1. 将每个 logit 除以 temperature
  // 2. 对结果进行 softmax 归一化
  
  // 请在此处编写你的代码：
  
}
`,
    solutionCode: `function applyTemperature(logits, temperature) {
  const t = Math.max(temperature, 1e-4);
  const scaled = logits.map(x => x / t);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map(x => Math.exp(x - maxVal));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sumExp);
}`,
    testCases: [
      {
        inputName: 'logits=[2.0, 4.0], temperature=0.5',
        description: '低温会拉大差距，4.0 的概率应显著高于常温 (T=1.0)',
        validate: (fn: any) => {
          try {
            const cold = fn([2.0, 4.0], 0.5);
            const warm = fn([2.0, 4.0], 1.0);
            if (cold[1] <= warm[1]) {
              return { passed: false, message: '在低温 T=0.5 下，高分项的概率应当比常温 T=1.0 更加集中' };
            }
            return {
              passed: true,
              message: `测试通过！低温概率分布 [${cold[0].toFixed(3)}, ${cold[1].toFixed(3)}]，常温 [${warm[0].toFixed(3)}, ${warm[1].toFixed(3)}]`,
            };
          } catch (e: any) {
            return { passed: false, message: `执行报错: ${e.message}` };
          }
        },
      },
    ],
  },
];
