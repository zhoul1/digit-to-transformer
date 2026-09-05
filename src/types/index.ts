export type ActiveTab =
  | 'chapters'
  | 'playground-digit'
  | 'playground-attention'
  | 'playground-llm'
  | 'code-sandbox'
  | 'pytorch-hub'
  | 'math-calculus'
  | 'math-probability'
  | 'math-statistics';

export type ChapterId = 'chapter-1' | 'chapter-2' | 'chapter-3' | 'chapter-4' | 'chapter-5';

export interface ChapterMeta {
  id: ChapterId;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  readTime: string;
  summary: string;
  keyConcepts: string[];
}

export interface QuizQuestion {
  id: string;
  chapterId: ChapterId | 'math-calculus' | 'math-probability' | 'math-statistics';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: '入门' | '进阶' | '核心';
  category: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCases: {
    inputName: string;
    description: string;
    validate: (fn: any) => { passed: boolean; message: string };
  }[];
}

export interface AttentionStepData {
  step: number;
  title: string;
  description: string;
}

export interface TokenItem {
  id: number;
  text: string;
  vector: number[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  english: string;
  category: '视觉与像素' | '序列与向量' | '注意力机制' | 'Transformer架构' | '生成与采样';
  shortDef: string;
  fullExplanation: string;
  formula?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}
