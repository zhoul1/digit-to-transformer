import { GlossaryItem } from '../types';

export const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    id: 'logits',
    term: '对数几率 / 未归一化分值',
    english: 'Logits',
    category: '视觉与像素',
    shortDef: '模型最后一层线性输出的原始实数值，尚未被压缩为概率。',
    fullExplanation:
      'Logits 是神经网络最后一层计算出的未归一化得分向量。它的取值范围是 (-∞, +∞)。数值越大，说明模型认为对应类别越有可能，但它不是严格的百分比，需要经过 Softmax 转换为总和为 1 的概率分布。',
    formula: 'z = W · h + b',
  },
  {
    id: 'softmax',
    term: '柔性最大值函数',
    english: 'Softmax',
    category: '视觉与像素',
    shortDef: '将任意维度的实数打分向量压缩为总和为 1.0 的平滑概率分布。',
    fullExplanation:
      'Softmax 通过对所有 Logits 进行指数运算 (e^z) 确保所有值为正数，然后除以它们的总和。它在放大最高分的同时，保留了低分项的梯度信息，是分类与大模型下一个词预测的核心算法。',
    formula: 'P(y=i) = exp(z_i) / ∑ exp(z_j)',
  },
  {
    id: 'token',
    term: '词元 / 标记',
    english: 'Token',
    category: '序列与向量',
    shortDef: '大模型阅读和处理文本的基本积木块，可以是汉字、词组或英文片段。',
    fullExplanation:
      '文本在输入模型前必须经过分词器（Tokenizer）。一个 Token 对应词表中的一个数字 ID。例如英文中 "learning" 可能被分为 "learn" 和 "ing" 两个 Token；常见中文单字通常为 1 个 Token。',
  },
  {
    id: 'embedding',
    term: '词嵌入 / 向量化',
    english: 'Embedding',
    category: '序列与向量',
    shortDef: '把离散的 Token ID 映射为连续几何高维空间中的坐标向量。',
    fullExplanation:
      '数字 ID 本身没有距离概念（ID 10 和 ID 11 不代表意思接近）。通过 Embedding 矩阵查表，每个词获得数百到数千维浮点数向量。在向量空间中，意思相近的词几何距离极近，甚至具备向量算术特性（国王 - 男人 + 女人 ≈ 女王）。',
    formula: 'x = EmbeddingTable[token_id] ∈ ℝ^{d_{model}}',
  },
  {
    id: 'vit-patch',
    term: '视觉微块切片',
    english: 'ViT Patch',
    category: '视觉与像素',
    shortDef: 'Vision Transformer 将整张图像切分成一格格固定尺寸的小方块，当作视觉 Token。',
    fullExplanation:
      'ViT 突破性地将 2D 图像划分为若干个固定大小的 Patch（如 16×16 或 7×7），每个 Patch 展平为一维向量，视同自然语言中的一个词（Token），彻底统一了计算机视觉与 NLP 的架构！',
  },
  {
    id: 'query-key-value',
    term: '查询、键与值',
    english: 'Query / Key / Value (QKV)',
    category: '注意力机制',
    shortDef: '自注意力机制的三位一体隐喻：读者需求 (Q)、书脊标签 (K)、正文知识 (V)。',
    fullExplanation:
      '每个 Token 的嵌入向量通过三个不同的线性投影矩阵生成 Q、K、V 向量。Q 和 K 做点积计算出相关度权重（我该关注谁？），最后用此权重对所有的 V 进行加权求和（我吸收了谁的信息？）。',
    formula: 'Attention(Q, K, V) = softmax(Q · K^T / √d_k) · V',
  },
  {
    id: 'scaled-dot-product',
    term: '缩放点积注意力',
    english: 'Scaled Dot-Product',
    category: '注意力机制',
    shortDef: '点积除以 √d_k，防止维度过高时数值过大导致 Softmax 梯度饱和消失。',
    fullExplanation:
      '当向量维度 d_k 很大时，两个随机向量点积的方差会扩大到 d_k。如果不除以根号 d_k，点积结果会非常大，导致 Softmax 输出极端接近 1 或 0，反向传播时的梯度几乎为 0，模型瘫痪。',
    formula: 'Scale = 1 / √d_k',
  },
  {
    id: 'causal-mask',
    term: '因果掩码 / 下三角遮罩',
    english: 'Causal Mask',
    category: '注意力机制',
    shortDef: '将注意力矩阵上三角区域强制置为 -∞，禁止 Token “偷看”未来的内容。',
    fullExplanation:
      '在自回归文本生成任务中，模型必须按照人类写作的先后时序进行推断。第 t 个词只能看到第 1 到第 t 个词，不能看到第 t+1 个词。通过给未来位置加上 -∞，经过 Softmax 后其注意力权重恰好为 0。',
  },
  {
    id: 'multi-head',
    term: '多头注意力',
    english: 'Multi-Head Attention',
    category: '注意力机制',
    shortDef: '将特征切分为多个并行子空间，让不同的“头”关注语法、代词指代等不同视角的联系。',
    fullExplanation:
      '单个注意力头容易被某一种强相关性主导。多头注意力就像多位不同专业的观察员：一个头专门捕捉主谓宾语法关系，另一个头专门捕捉跨句子的长距离代词指代，最后拼接融合，极大地提升了表征能力。',
  },
  {
    id: 'positional-encoding',
    term: '位置编码',
    english: 'Positional Encoding',
    category: 'Transformer架构',
    shortDef: '为无序的自注意力机制注入词语的时空先后座标信息。',
    fullExplanation:
      '自注意力机制本质上是集合运算（无序）。“猫咬狗”和“狗咬猫”对纯注意力而言没有区别。因此必须把包含时序信息的正余弦波形或可学习位置向量直接叠加进词嵌入中。',
    formula: 'PE(pos, 2i) = sin(pos / 10000^{2i/d})',
  },
  {
    id: 'residual-connection',
    term: '残差连接',
    english: 'Residual Connection',
    category: 'Transformer架构',
    shortDef: '将原始输入直接加到子层的输出上 (x + F(x))，打造梯度高速公路。',
    fullExplanation:
      '由何恺明团队提出。残差让深层网络在反向传播时总能获得常数项为 1 的无衰减梯度流，彻底攻克了上百层深层网络梯度消失的历史性难题。',
    formula: 'y = LayerNorm(x + SubLayer(x))',
  },
  {
    id: 'feed-forward-network',
    term: '前馈神经网络',
    english: 'Feed-Forward Network (FFN)',
    category: 'Transformer架构',
    shortDef: '每个注意力层后紧跟的双层全连接网络，是大模型存储事实知识的记忆库。',
    fullExplanation:
      '自注意力机制负责在不同 Token 之间搬运与融合信息，而 FFN（先升维 4 倍后降维）负责在独立维度上进行非线性变换，研究表明海量事实知识（如历史常识、地理数据）正是固化在 FFN 的权重矩阵中。',
  },
  {
    id: 'autoregressive',
    term: '自回归生成',
    english: 'Autoregressive Loop',
    category: '生成与采样',
    shortDef: '基于已知的前文序列，预测下一个词，拼接后不断重复该过程。',
    fullExplanation:
      '现代 GPT 系列大模型都是自回归解码器。每次生成只吐出一个 Token，然后将新 Token 追加到输入序列的末尾，重新输入模型预测再下一个，周而复始直到产生结束符 (EOS) 或达到最大长度。',
  },
  {
    id: 'temperature',
    term: '采样温度系数',
    english: 'Temperature',
    category: '生成与采样',
    shortDef: '控制 Softmax 分布平坦度的超参数，调节 AI 的严谨度与创造力。',
    fullExplanation:
      '温度 T 处在 Softmax 的指数分母上 (z_i / T)。低温 (T < 0.5) 让强者更强，输出极度确定和严谨；高温 (T > 1.0) 抹平差异，让生僻冷门词有更多被选中机会，模型更具想象力但易胡言乱语。',
  },
  {
    id: 'top-k-top-p',
    term: 'Top-K 与 Top-p 核采样',
    english: 'Top-K & Top-p (Nucleus) Sampling',
    category: '生成与采样',
    shortDef: '通过截断候选词列表，排除尾部低概率怪异词汇的采样安全护栏。',
    fullExplanation:
      'Top-K 是硬性保留概率排名前 K 个词；Top-p（核采样）是动态累加概率，直到总和达到 p（如 0.9）为止的最小词集。两者结合可以既保证输出多样性，又绝不挑选离谱的无意义词汇。',
  },
];
