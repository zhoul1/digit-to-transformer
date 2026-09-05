import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'badge-digit',
    title: '手写神笔小试',
    description: '在手绘画板中绘制手写数字，成功运行 28×28 灰阶前向传播。',
    icon: 'PenTool',
    badgeColor: 'from-blue-500 to-indigo-600',
    unlocked: false,
  },
  {
    id: 'badge-embedding',
    title: '几何语义漫游者',
    description: '探索 2D 词嵌入几何空间，体验“国王-男人+女人≈女王”向量算术。',
    icon: 'Compass',
    badgeColor: 'from-indigo-500 to-purple-600',
    unlocked: false,
  },
  {
    id: 'badge-attention',
    title: '注意力洞察大师',
    description: '体验自注意力光束弧线与矩阵热力图，理解 QKV 图书馆检索与因果掩码。',
    icon: 'Network',
    badgeColor: 'from-purple-500 to-pink-600',
    unlocked: false,
  },
  {
    id: 'badge-transformer',
    title: '变形金刚架构师',
    description: '通读 Transformer 架构全景，搞懂位置编码、残差连接与 FFN 记忆。',
    icon: 'Layers',
    badgeColor: 'from-amber-500 to-orange-600',
    unlocked: false,
  },
  {
    id: 'badge-llm',
    title: '生成采样炼丹师',
    description: '在微型 LLM 沙盒中调节 Temperature、Top-K/Top-p，体验自回归循环。',
    icon: 'Cpu',
    badgeColor: 'from-emerald-500 to-teal-600',
    unlocked: false,
  },
  {
    id: 'badge-code',
    title: '算法沙盒特级宗师',
    description: '亲手实现 Softmax、缩放点积、因果掩码与温度采样，并通过全部测试用例。',
    icon: 'Code2',
    badgeColor: 'from-rose-500 to-red-600',
    unlocked: false,
    progress: { current: 0, total: 4 },
  },
];
