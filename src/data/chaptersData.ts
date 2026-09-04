import { ChapterMeta } from '../types';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'chapter-1',
    number: 1,
    title: '像素与神经元：数字识别是如何工作的？',
    subtitle: '探秘计算机如何把 28x28 的灰阶像素转化成 0~9 的概率',
    icon: 'Brain',
    readTime: '8 分钟阅读 + 自由实验',
    summary:
      '手写数字识别是深度学习的“Hello World”。在本章中，我们将拆解图像本质（灰阶矩阵）、神经元的加权求和、非线性激活函数，以及如何使用 Softmax 将抽象分值转化为直观的分类概率。',
    keyConcepts: [
      '28×28 像素展开成 784 维向量',
      '线性加权求和：z = W · x + b',
      '非线性激活：ReLU 为什么至关重要',
      'Softmax 归一化：将分值变成概率',
      '损失函数与梯度更新直觉',
    ],
  },
  {
    id: 'chapter-2',
    number: 2,
    title: '惊天跨越：从二维图像到一维序列与 Token',
    subtitle: '如何将看一张图片的分类问题，升级为读一段话的自回归预测？',
    icon: 'Shuffle',
    readTime: '7 分钟阅读',
    summary:
      '人类语言不是固定的 28x28 方格，而是动态、不定长的符号序列。本章带你理解什么是 Token，词嵌入（Embedding）如何给离散文字赋予几何空间坐标，以及为什么两者的本质都是“Softmax 多分类”。',
    keyConcepts: [
      '为什么固定尺寸的 MLP 无法处理自由文本',
      'Token 与词表：计算机的认字身份证',
      '词嵌入 (Embedding)：向量空间的几何魔法',
      '核心思维统一：图像分类 vs 下一个词预测',
      'RNN 的长记忆困境与 CNN 的局部视野',
    ],
  },
  {
    id: 'chapter-3',
    number: 3,
    title: '注意力机制革命：Self-Attention 与多头注意力',
    subtitle: '彻底搞懂 Q (Query)、K (Key)、V (Value) 的图书馆隐喻与矩阵运算',
    icon: 'Eye',
    readTime: '10 分钟阅读 + 矩阵演算',
    summary:
      'Attention Is All You Need 论文让全世界着迷。本章用最通俗易懂的“图书检索”比喻带你推导 Q、K、V，一步步手动演算点积、缩放根号 dk、防止偷看的因果掩码，以及多头注意力的多维度观察视角。',
    keyConcepts: [
      'Q、K、V 的直观比喻：搜索词、标签与正文',
      '点积相似度：衡量两个词的相关程度',
      '为什么必须除以 √d_k：避免 Softmax 梯度饱和',
      '因果掩码 (Causal Mask)：下三角矩阵的秘密',
      '多头注意力 (Multi-Head)：语法头与语义头',
    ],
  },
  {
    id: 'chapter-4',
    number: 4,
    title: '组装变形金刚：Transformer 完整架构拆解',
    subtitle: '位置编码、残差连接、LayerNorm 与 FFN 是如何拼成现代 LLM 的？',
    icon: 'Layers',
    readTime: '9 分钟阅读',
    summary:
      '现代大模型（如 GPT-4、Llama、DeepSeek）的核心都是 Decoder-Only Transformer。本章带你组装完整拼图：如何给无序的注意力赋予顺序感？残差高速公路与层归一化如何保障千亿参数稳定训练？FFN 如何储存知识？',
    keyConcepts: [
      '位置编码 (Positional Encoding)：让模型理解先后',
      '残差连接 (Residual)：解决深层梯度消失',
      '层归一化 (LayerNorm)：让数据分布保持平稳',
      '前馈网络 (FFN)：注意力沟通，FFN 记忆事实',
      '现代主流 Decoder-Only 架构全流向',
    ],
  },
  {
    id: 'chapter-5',
    number: 5,
    title: '大语言模型生成实战：自回归与采样参数',
    subtitle: '控制 AI 的“创造力”与“胡说八道”：Temperature、Top-K 与 Top-p',
    icon: 'Sparkles',
    readTime: '8 分钟阅读 + 交互生成沙盒',
    summary:
      '大模型如何一个词一个词地写出文章？本章拆解自回归生成循环，并通过动态概率分布曲线图，彻底揭秘温度系数 (Temperature)、Top-K 截断与核采样 (Top-p) 对模型回答的决定性影响。',
    keyConcepts: [
      '自回归循环：Prompt -> Logits -> Sample -> Append',
      '温度系数 (Temperature)：从冷酷严谨到天马行空',
      'Top-K 截断：只在最靠前的高频候选中挑选',
      'Top-p (Nucleus) 核采样：动态概率累积过滤',
      '预训练、SFT 指令微调与 RLHF 对齐全景图',
    ],
  },
];
