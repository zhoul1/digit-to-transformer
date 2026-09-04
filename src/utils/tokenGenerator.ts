import { softmax } from './attentionMath';

export interface CandidateToken {
  token: string;
  logit: number;
  prob: number;
  inTopK: boolean;
  inTopP: boolean;
  isSampled: boolean;
}

export interface GenerationStepResult {
  stepIndex: number;
  currentToken: string;
  contextTokens: string[];
  candidates: CandidateToken[];
  temperature: number;
  topK: number;
  topP: number;
}

// 模拟预训练知识库：根据上下文匹配生成下一个候选词与原始 logits
export interface Scenario {
  id: string;
  name: string;
  description: string;
  initialPrompt: string[];
  vocabularyMap: {
    [prefix: string]: { token: string; baseLogit: number }[];
  };
  defaultNext: { token: string; baseLogit: number }[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'ai-future',
    name: '🤖 人工智能与未来',
    description: '模拟大语言模型续写科技与 AI 相关的经典语录与见解',
    initialPrompt: ['大', '模', '型', '正', '在'],
    vocabularyMap: {
      '大 模型 正在': [
        { token: '改', baseLogit: 5.8 },
        { token: '颠', baseLogit: 4.9 },
        { token: '引', baseLogit: 4.2 },
        { token: '加', baseLogit: 3.5 },
        { token: '赋', baseLogit: 2.8 },
        { token: '推', baseLogit: 2.2 },
        { token: '发', baseLogit: 1.5 },
        { token: '吃', baseLogit: -1.2 },
        { token: '睡', baseLogit: -2.0 },
      ],
      '大 模型 正在 改': [
        { token: '变', baseLogit: 6.5 },
        { token: '进', baseLogit: 3.8 },
        { token: '写', baseLogit: 4.2 },
        { token: '良', baseLogit: 2.1 },
        { token: '造', baseLogit: 3.0 },
        { token: '动', baseLogit: 1.1 },
      ],
      '正在 改变': [
        { token: '我', baseLogit: 5.2 },
        { token: '世', baseLogit: 6.1 },
        { token: '人', baseLogit: 4.9 },
        { token: '未', baseLogit: 4.3 },
        { token: '科', baseLogit: 3.7 },
        { token: '经', baseLogit: 2.9 },
      ],
      '改变 世': [
        { token: '界', baseLogit: 7.2 },
        { token: '纪', baseLogit: 2.8 },
        { token: '代', baseLogit: 2.1 },
        { token: '面', baseLogit: 1.4 },
      ],
      '改变 世界': [
        { token: '的', baseLogit: 6.2 },
        { token: '，', baseLogit: 5.4 },
        { token: '每', baseLogit: 4.1 },
        { token: '方', baseLogit: 3.3 },
        { token: '格', baseLogit: 2.7 },
      ],
      '世界 的': [
        { token: '各', baseLogit: 4.8 },
        { token: '模', baseLogit: 4.2 },
        { token: '样', baseLogit: 5.6 },
        { token: '运', baseLogit: 3.9 },
        { token: '未', baseLogit: 4.5 },
      ],
      '世界 的 样': [
        { token: '貌', baseLogit: 7.1 },
        { token: '子', baseLogit: 6.0 },
        { token: '式', baseLogit: 2.4 },
      ],
    },
    defaultNext: [
      { token: '以', baseLogit: 3.2 },
      { token: '及', baseLogit: 2.9 },
      { token: '更', baseLogit: 3.7 },
      { token: '高', baseLogit: 2.5 },
      { token: '新', baseLogit: 4.1 },
      { token: '的', baseLogit: 4.8 },
      { token: '。', baseLogit: 5.0 },
    ],
  },
  {
    id: 'digit-sequence',
    name: '🔢 数字序列接龙 (从数字到生成)',
    description: '把数字作为 Token，观察模型如何像学习语言一样预测下一个数字',
    initialPrompt: ['3', '.', '1', '4', '1', '5'],
    vocabularyMap: {
      '3 . 1 4 1 5': [
        { token: '9', baseLogit: 6.8 },
        { token: '2', baseLogit: 2.1 },
        { token: '6', baseLogit: 1.8 },
        { token: '0', baseLogit: 0.5 },
        { token: '3', baseLogit: 0.2 },
      ],
      '1 4 1 5 9': [
        { token: '2', baseLogit: 7.0 },
        { token: '6', baseLogit: 2.5 },
        { token: '5', baseLogit: 1.9 },
        { token: '3', baseLogit: 0.8 },
      ],
      '4 1 5 9 2': [
        { token: '6', baseLogit: 7.2 },
        { token: '5', baseLogit: 2.2 },
        { token: '3', baseLogit: 1.5 },
      ],
      '1 5 9 2 6': [
        { token: '5', baseLogit: 7.5 },
        { token: '3', baseLogit: 2.4 },
        { token: '8', baseLogit: 1.2 },
      ],
      '5 9 2 6 5': [
        { token: '3', baseLogit: 7.3 },
        { token: '5', baseLogit: 2.6 },
        { token: '8', baseLogit: 1.8 },
      ],
    },
    defaultNext: [
      { token: '3', baseLogit: 3.5 },
      { token: '5', baseLogit: 3.2 },
      { token: '8', baseLogit: 3.8 },
      { token: '9', baseLogit: 2.9 },
      { token: '7', baseLogit: 2.4 },
    ],
  },
];

// 计算下一轮的生成候选与采样
export function computeNextTokenStep(
  context: string[],
  scenario: Scenario,
  temperature = 1.0,
  topK = 5,
  topP = 0.9,
  sampleMode: 'greedy' | 'sample' = 'sample'
): GenerationStepResult {
  // 1. 根据当前上下文后几个词查找候选词
  let candidatesRaw: { token: string; baseLogit: number }[] = [];
  const maxSuffixLen = 5;

  for (let len = Math.min(context.length, maxSuffixLen); len >= 1; len--) {
    const suffix = context.slice(context.length - len).join(' ');
    if (scenario.vocabularyMap[suffix]) {
      candidatesRaw = scenario.vocabularyMap[suffix];
      break;
    }
  }

  if (candidatesRaw.length === 0) {
    candidatesRaw = scenario.defaultNext;
  }

  // 2. 应用 Temperature 缩放并计算 Softmax
  const logits = candidatesRaw.map((c) => c.baseLogit);
  const probs = softmax(logits, temperature);

  // 3. 排序构造 candidates 对象
  const sortedItems = candidatesRaw
    .map((c, idx) => ({
      token: c.token,
      logit: c.baseLogit,
      prob: probs[idx],
    }))
    .sort((a, b) => b.prob - a.prob);

  // 4. 计算 Top-K 与 Top-p 掩码
  let cumSum = 0;
  const processedCandidates: CandidateToken[] = sortedItems.map((item, idx) => {
    const inTopK = idx < topK;
    cumSum += item.prob;
    // Top-p: 累积概率达到 topP 之前以及刚达到它的那一项包含在内核中
    const inTopP = cumSum - item.prob < topP;
    return {
      token: item.token,
      logit: item.logit,
      prob: item.prob,
      inTopK,
      inTopP,
      isSampled: false,
    };
  });

  // 5. 采样策略：根据 Top-K 和 Top-p 综合过滤
  const validPool = processedCandidates.filter((c) => c.inTopK && c.inTopP);
  const poolToUse = validPool.length > 0 ? validPool : [processedCandidates[0]];

  let chosenToken = poolToUse[0].token;

  if (sampleMode === 'greedy' || temperature <= 0.05) {
    chosenToken = poolToUse[0].token;
  } else {
    // 重新归一化 poolToUse 概率
    const sumPool = poolToUse.reduce((s, c) => s + c.prob, 0);
    const r = Math.random() * sumPool;
    let acc = 0;
    for (const cand of poolToUse) {
      acc += cand.prob;
      if (r <= acc) {
        chosenToken = cand.token;
        break;
      }
    }
  }

  // 标记被选中的 token
  processedCandidates.forEach((c) => {
    if (c.token === chosenToken) c.isSampled = true;
  });

  return {
    stepIndex: context.length,
    currentToken: chosenToken,
    contextTokens: context,
    candidates: processedCandidates,
    temperature,
    topK,
    topP,
  };
}
