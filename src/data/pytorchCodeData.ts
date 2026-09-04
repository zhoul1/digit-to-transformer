export interface PyTorchSnippet {
  id: string;
  title: string;
  filename: string;
  description: string;
  tags: string[];
  code: string;
  shapeExplanation: { tensor: string; shape: string; meaning: string }[];
}

export const PYTORCH_SNIPPETS: PyTorchSnippet[] = [
  {
    id: 'mnist-mlp',
    title: '手写数字识别：PyTorch 极简多层感知机 (MLP)',
    filename: 'mnist_mlp.py',
    description:
      '从零构建一个 28x28 像素手写数字识别神经网络，涵盖展平层、线性层、ReLU 激活以及 CrossEntropyLoss 交叉熵训练全流程。',
    tags: ['PyTorch', 'MNIST', '全连接网络', '入门'],
    shapeExplanation: [
      { tensor: 'x (输入图片批次)', shape: '[batch_size, 1, 28, 28]', meaning: '单通道 28x28 灰阶图像' },
      { tensor: 'x_flat (展平向量)', shape: '[batch_size, 784]', meaning: '28*28 个像素点排成一维' },
      { tensor: 'h (隐藏层特征)', shape: '[batch_size, 128]', meaning: '提取出的 128 个几何特征模式' },
      { tensor: 'logits (预测分值)', shape: '[batch_size, 10]', meaning: '未归一化的 0~9 数字预测分值' },
      { tensor: 'probs (概率分布)', shape: '[batch_size, 10]', meaning: '经过 Softmax 后的各个数字概率' },
    ],
    code: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 1. 定义多层感知机 (MLP) 模型
class DigitClassifierMLP(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=128, num_classes=10):
        super(DigitClassifierMLP, self).__init__()
        # 全连接层 1: 784 维像素 -> 128 维特征
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        # 非线性激活函数: ReLU(z) = max(0, z)
        self.relu = nn.ReLU()
        # 全连接层 2: 128 维特征 -> 10 维分类分值 (Logits)
        self.fc2 = nn.Linear(hidden_dim, num_classes)
        
    def forward(self, x):
        # 步骤 1: 将 [batch, 1, 28, 28] 展平成 [batch, 784]
        x = x.view(x.size(0), -1)
        # 步骤 2: 第一层线性加权与非线性激活
        h = self.relu(self.fc1(x))
        # 步骤 3: 第二层输出 10 个类别的未归一化分值
        logits = self.fc2(h)
        return logits

# 2. 训练与推断演示
def train_and_evaluate():
    # 数据预处理: 转换为 Tensor 并归一化到 [0, 1]
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    
    # 实例化模型、损失函数与优化器
    model = DigitClassifierMLP()
    # CrossEntropyLoss 内部自动集成了 LogSoftmax 与 NLLLoss，数值更稳定
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    print("模型结构定义完成:")
    print(model)
    
    # 模拟一次前向传播推断
    dummy_input = torch.randn(4, 1, 28, 28) # 模拟 4 张手写数字图片
    logits = model(dummy_input)
    # 计算 Softmax 概率
    probs = torch.softmax(logits, dim=-1)
    # 取得分最高的类别作为预测结果
    predictions = torch.argmax(probs, dim=-1)
    
    print("\\n模拟 4 张图片的推断结果:")
    print(f"预测数字类别: {predictions.tolist()}")
    print(f"首张图片各数字概率: {[round(p, 3) for p in probs[0].tolist()]}")

if __name__ == '__main__':
    train_and_evaluate()
`,
  },
  {
    id: 'self-attention',
    title: '注意力革命：PyTorch 缩放点积与多头自注意力 (Multi-Head Attention)',
    filename: 'multi_head_attention.py',
    description:
      '标准工业级多头自注意力模块，清晰展示 Q、K、V 线性投影、矩阵转置重组、因果掩码遮蔽以及与 Value 值的加权乘积。',
    tags: ['PyTorch', 'Transformer', 'Self-Attention', '核心机制'],
    shapeExplanation: [
      { tensor: 'x (输入 Token 序列)', shape: '[batch, seq_len, d_model]', meaning: '每个 Token 对应的词嵌入向量' },
      { tensor: 'Q, K, V', shape: '[batch, num_heads, seq_len, d_k]', meaning: '拆分给每个注意力头的多重视角向量' },
      { tensor: 'scores (点积打分)', shape: '[batch, num_heads, seq_len, seq_len]', meaning: '词与词之间的相关度矩阵' },
      { tensor: 'attn_weights (注意力权重)', shape: '[batch, num_heads, seq_len, seq_len]', meaning: 'Softmax 归一化后的注意力分配百分比' },
      { tensor: 'out (上下文感知输出)', shape: '[batch, seq_len, d_model]', meaning: '融合了全句上下文信息的新词向量' },
    ],
    code: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, d_model=64, num_heads=4, is_causal=True):
        super(MultiHeadSelfAttention, self).__init__()
        assert d_model % num_heads == 0, "d_model 必须能被 num_heads 整除"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.is_causal = is_causal
        
        # Q, K, V 投影矩阵 (一次性投影再拆分，计算效率最高)
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        
        # 多头合并输出投影
        self.out_proj = nn.Linear(d_model, d_model)
        
    def forward(self, x):
        batch_size, seq_len, _ = x.shape
        
        # 1. 线性投影: [batch, seq_len, d_model] -> [batch, num_heads, seq_len, d_k]
        Q = self.q_proj(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.k_proj(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.v_proj(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        # 2. 计算点积相似度矩阵并除以 sqrt(d_k) 进行缩放
        # [batch, heads, seq, d_k] x [batch, heads, d_k, seq] -> [batch, heads, seq, seq]
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        # 3. 因果掩码 (Causal Mask): 遮蔽未来时刻信息 (将上三角填为 -inf)
        if self.is_causal:
            mask = torch.triu(torch.ones(seq_len, seq_len, device=x.device), diagonal=1).bool()
            scores = scores.masked_fill(mask, float('-inf'))
            
        # 4. Softmax 归一化为概率权重
        attn_weights = F.softmax(scores, dim=-1)
        
        # 5. 加权聚合 Value 向量: [batch, heads, seq, seq] x [batch, heads, seq, d_k]
        context = torch.matmul(attn_weights, V)
        
        # 6. 拼接多头并线性投影复原
        context = context.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        output = self.out_proj(context)
        
        return output, attn_weights

# 测试运行
if __name__ == '__main__':
    # 模拟 2 句话，每句 5 个 Token，每个 Token 维度为 64
    x = torch.randn(2, 5, 64)
    mha = MultiHeadSelfAttention(d_model=64, num_heads=4, is_causal=True)
    out, weights = mha(x)
    print(f"输入形状: {x.shape}")
    print(f"注意力输出形状: {out.shape}")
    print(f"注意力权重形状: {weights.shape} (包含 4 个头的独立注意力热力图)")
`,
  },
  {
    id: 'mini-gpt',
    title: '完整架构：Decoder-Only 微型大语言模型 (Mini-GPT) 与自回归生成',
    filename: 'mini_gpt.py',
    description:
      '完整的 GPT 风格微型大语言模型，包含 Token 嵌入、位置编码、Transformer 解码块、残差连接、LayerNorm，以及自回归逐步生成与 Temperature 采样函数。',
    tags: ['PyTorch', 'GPT', 'Transformer', '文本生成', '完整模型'],
    shapeExplanation: [
      { tensor: 'idx (输入 Token ID 列表)', shape: '[batch, seq_len]', meaning: '文本在词表中的整数代号' },
      { tensor: 'tok_emb + pos_emb', shape: '[batch, seq_len, d_model]', meaning: '结合了词义与绝对位置的稠密向量' },
      { tensor: 'hidden_states', shape: '[batch, seq_len, d_model]', meaning: '经过多层 Transformer 块充分交流后的特征' },
      { tensor: 'logits', shape: '[batch, seq_len, vocab_size]', meaning: '每个位置对下一个 Token 的预测概率分值' },
    ],
    code: `import math
import torch
import torch.nn as nn
import torch.nn.functional as F

# 1. 前馈网络 (Feed-Forward Network)
class FeedForward(nn.Module):
    def __init__(self, d_model, mult=4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_model, d_model * mult),
            nn.GELU(), # 现代 LLM 常用的 GELU 激活函数
            nn.Linear(d_model * mult, d_model)
        )
    def forward(self, x):
        return self.net(x)

# 2. Transformer 解码器块 (包含残差连接与前置 LayerNorm)
class TransformerBlock(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.ln1 = nn.LayerNorm(d_model)
        self.attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
        self.ln2 = nn.LayerNorm(d_model)
        self.ffn = FeedForward(d_model)
        
    def forward(self, x):
        # 因果下三角掩码
        seq_len = x.size(1)
        mask = nn.Transformer.generate_square_subsequent_mask(seq_len).to(x.device)
        
        # Pre-LN 残差连接: x = x + Attention(LN(x))
        norm_x = self.ln1(x)
        attn_out, _ = self.attn(norm_x, norm_x, norm_x, attn_mask=mask, is_causal=True)
        x = x + attn_out
        
        # Pre-LN 残差连接: x = x + FFN(LN(x))
        x = x + self.ffn(self.ln2(x))
        return x

# 3. 完整 Mini-GPT 模型
class MiniGPT(nn.Module):
    def __init__(self, vocab_size=1000, d_model=128, num_layers=3, num_heads=4, max_seq_len=64):
        super().__init__()
        self.max_seq_len = max_seq_len
        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(max_seq_len, d_model)
        
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads) for _ in range(num_layers)
        ])
        self.ln_f = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size, bias=False)
        
    def forward(self, idx):
        batch, seq_len = idx.shape
        assert seq_len <= self.max_seq_len, "序列超出最大上下文长度"
        
        pos = torch.arange(0, seq_len, device=idx.device).unsqueeze(0)
        # 词嵌入与位置嵌入相加
        x = self.tok_emb(idx) + self.pos_emb(pos)
        
        # 通过堆叠的 Transformer 解码层
        for block in self.blocks:
            x = block(x)
            
        x = self.ln_f(x)
        logits = self.head(x) # [batch, seq_len, vocab_size]
        return logits

    # 自回归逐词生成循环 (Autoregressive Generation)
    @torch.no_grad()
    def generate(self, prompt_tokens, max_new_tokens=10, temperature=1.0, top_k=5):
        self.eval()
        curr_tokens = prompt_tokens.clone()
        
        for _ in range(max_new_tokens):
            # 如果超出窗口则截断前面
            idx_cond = curr_tokens[:, -self.max_seq_len:]
            logits = self(idx_cond)
            # 只取最后一个位置的预测分值
            next_logit = logits[:, -1, :] / max(temperature, 1e-4)
            
            # Top-K 截断过滤
            if top_k is not None:
                v, _ = torch.topk(next_logit, min(top_k, next_logit.size(-1)))
                next_logit[next_logit < v[:, [-1]]] = -float('Inf')
                
            # Softmax 概率
            probs = F.softmax(next_logit, dim=-1)
            
            # 多项分布采样出下一个 Token
            next_token = torch.multinomial(probs, num_samples=1)
            # 拼接自回归序列
            curr_tokens = torch.cat((curr_tokens, next_token), dim=1)
            
        return curr_tokens

# 演示运行
if __name__ == '__main__':
    model = MiniGPT(vocab_size=500, d_model=64, num_layers=2, num_heads=2)
    # 输入一个起始 Prompt: Token [12, 45, 99]
    prompt = torch.tensor([[12, 45, 99]])
    generated = model.generate(prompt, max_new_tokens=6, temperature=0.8, top_k=3)
    print(f"输入提示词 Tokens: {prompt[0].tolist()}")
    print(f"自回归生成结果 Tokens: {generated[0].tolist()}")
`,
  },
];
