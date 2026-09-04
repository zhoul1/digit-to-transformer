export type ActiveTab = 'chapters' | 'playground-digit' | 'playground-attention' | 'playground-llm' | 'code-sandbox' | 'pytorch-hub';

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
  chapterId: ChapterId;
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
