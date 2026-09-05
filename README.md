# 🧠 Digits to Transformer：从手写数字识别到大语言模型

> **零门槛 · 沉浸式 · 纯前端 · 有动画 · 有代码 · 带实战 Playground 的 Transformer 进阶学习平台**

---

## 📖 项目简介 (Overview)

为什么大语言模型能够写诗、写代码、进行深度思考？很多初学者在入门深度学习与大语言模型（LLM）时，往往被繁杂的矩阵公式、抽象的注意力算法和复杂的工程架构劝退。

**本项目开辟了一条最符合人类直觉的认知路线**：
从计算机视觉最简单直观的 **手写数字识别（MNIST）** 入手，拆解计算机如何“看见”一张图片并转换为概率分布；再自然跳跃到一维 **Token 序列与词嵌入（Embedding）**；接着用通俗易懂的“图书馆图书检索”隐喻彻底推导 **自注意力机制 (Self-Attention)**；最后组装成现代大模型基石 **Transformer 解码器**，并亲手操纵大模型的 **自回归生成循环** 与 **Temperature / Top-K / Top-p 采样参数**！

---

## ✨ 核心亮点与创新设计 (Key Features)

### 1. 🚶 5 大循序渐进认知升级章节
1. **第 1 节 · 像素与神经元**：
   - 揭秘 $28 \times 28$ 灰阶网格展开为 784 维向量；
   - 线性加权求和 $z = W \cdot x + b$ 与特征模板滤镜；
   - 为什么没有非线性激活函数（ReLU）深度学习就会失效？（内嵌可拖动导通滑块）；
   - Softmax 函数如何将任意未归一化分值压缩为总和为 1 的 0~9 数字概率分布；
   - **全新拓展 · ViT (Vision Transformer) 图像切片交互**：把 28×28 图像切分成 16 个 Patch（小微块），每个微块展平为 49 维向量，作为视觉 Token 读入模型，打通图像与语言的终极桥梁！
2. **第 2 节 · 惊天跨越：从网格到序列与 Token**：
   - 为什么识别图片的固定尺寸网络无法处理自由文本？
   - 什么是 Token？BPE 词元算法与词表身份证；
   - **全新拓展 · 2D 词嵌入几何空间交互探索器**：在二维坐标系中动态演示 `👑国王 - 👨男人 + 👩女人 ≈ 👸女王` 的向量平移合成动画；
   - **底层本质大统一**：手写数字是 10 分类概率预测，LLM 是 50,000 词表多分类预测！
3. **第 3 节 · 注意力机制革命 (Self-Attention)**：
   - RNN 的长距离遗忘困境 vs 现代注意力的 $O(1)$ 任意跨度直达；
   - **图书馆检索生动隐喻**：Query (读者查阅)、Key (书脊标签)、Value (书本正文)；
   - 5 步数学推导：点积相似度 $\to$ 缩放 $\div \sqrt{d_k}$ 防梯度饱和 $\to$ 因果掩码防偷看未来 $\to$ Softmax 权重 $\to$ 加权输出；
   - 多头注意力（Multi-Head Attention）：语法头、代词指代头、长距因果头。
4. **第 4 节 · 组装变形金刚 (Transformer 完整架构)**：
   - **全新拓展 · 正弦余弦位置编码波形探索器**：滑动调节位置 $pos$ 与通道维度 $dim$，实时绘制连续波形采样曲线与 2D 条形码热度图，搞懂时空座标指纹；
   - 残差连接 (Residual) 与层归一化 (LayerNorm)：千亿大模型稳定训练的高速公路；
   - 前馈神经网络 (FFN)：注意力负责跨词交流，FFN 负责长久固化事实记忆；
   - 现代主流 Decoder-Only（GPT-4、Llama、DeepSeek）全流程走向。
5. **第 5 节 · 大模型生成实战与采样控制**：
   - 自回归生成循环四部曲（Prompt $\to$ Logits $\to$ Sample $\to$ Append $\to$ Repeat）；
   - 操纵 AI 创造力与严谨度的三大参数：**Temperature**、**Top-K**、**Top-p (核采样)**；
   - 现代大模型全生命周期：预训练 $\to$ SFT 指令微调 $\to$ RLHF / DPO 对齐。

---

### 2. 🎮 5 大沉浸式交互实战工坊 (Interactive Playgrounds)

* **🎨 实时手写数字识别画板 (Digit Canvas Playground)**
  - 纯前端自包含多层感知机（MLP）推断引擎，零后端依赖；
  - 自由手绘画布，支持**细 (12px) / 中 (18px) / 粗 (26px)** 笔刷切换、橡皮擦与 0~9 经典数字预设；
  - **神经元感受野覆层透视 (XAI Receptive Field Overlay)**：点击任意 N0~N15 神经元，实时在 28×28 画布上以半透明黄色高亮叠加其关注的笔画热区；
  - **对抗噪点注入测试 (Noise Slider)**：调节 0% ~ 40% 随机高斯噪点，观测模型鲁棒性；
  - **10 分类 Softmax 概率条**：实时高亮最高置信度预测结果。
* **🔍 自注意力矩阵演算实验室 (Self-Attention Lab)**
  - **全新核心特性 · Token 动态注意力光束弧线 (Token Attention Ray Arcs)**：将句子 Tokens 水平排开，点击任意 Token 动态发射带有权重发光宽度的贝塞尔光束，右上角清晰标注未来 Token 的 `🔒 Masked` 遮蔽状态；
  - 6 步矩阵推演：$Q/K/V$ 向量 $\to$ $Q \cdot K^T$ 原始点积 $\to$ 缩放除以 $\sqrt{d_k}$ $\to$ 因果掩码遮蔽 $\to$ Softmax 权重热力图 $\to$ 加权输出；
  - 自由切换 **因果单向掩码 (Causal Mask)**（GPT 模式 vs BERT 模式）；
  - 自由切换 **多头注意力视角**（主谓关联头、远距离因果头、就近修饰头）。
* **⚡ 微型大模型自回归生成实验室 (Mini-LLM Generation Lab)**
  - 完整模拟 Transformer 解码器自回归生成循环；
  - 提供单步推断（Step Next）与自动连续生成模式；
  - **超参数调节台**：实时调节 Temperature、Top-K、Top-p，右侧词表柱状图发生平滑非线性形变，高亮最终采样的 Token。
* **💻 算法核心函数代码沙盒 (Interactive Code Lab)**
  - 4 道互动代码编程挑战：数值稳定 Softmax、缩放点积 Scaled Dot-Product、因果掩码 Causal Mask、温度采样算法；
  - 内置浏览器执行环境与自动化单元测试，一键运行判题，通关触发彩色纸屑庆祝；
  - 配备参考标准答案与一键填入跑通，与全局成就系统自动联动。
* **🐍 官方工业级 PyTorch 教学源码库 (PyTorch Hub)**
  - 3 份纯净可运行的标准 PyTorch 脚本：
    1. `01_mnist_mlp.py`：MNIST 手写数字识别完整训练流水线；
    2. `02_multi_head_attention.py`：多头自注意力层标准实现；
    3. `03_mini_gpt_autoregressive.py`：包含 Block、FFN 与 `.generate()` 自回归生成的迷你 GPT 模型；
  - 配备核心张量维度变化表（Tensor Flow Shapes），支持一键复制代码与直接下载源码。

---

### 3. 🏆 激励与知识体系 (Gamification & Knowledge Base)

* **📖 深度学习核心概念速查手册 (Glossary Modal)**：
  - 整理了从 Logits、Softmax、Embedding、ViT Patch 到 QKV、Causal Mask、FFN、Temperature、Top-p 等 15 大核心术语；
  - 提供分类筛选、极速搜索、一句话大白话直觉、数学表达公式与前沿深度解析。
* **🎖️ 认知升级勋章陈列室 (Achievements & Badges System)**：
  - 记录学习轨迹与实战通关，包含 6 枚精美成就徽章（手写神笔小试、几何语义漫游者、注意力洞察大师、变形金刚架构师、生成采样炼丹师、算法沙盒特级宗师）；
  - 基于 LocalStorage 本地持久化，实时在导航栏展示解锁勋章进度。

---

## 🛠️ 技术栈 (Tech Stack)

* **核心框架**：React 19 + TypeScript + Vite 8
* **样式与视觉**：Tailwind CSS v4 (现代化暗黑赛博朋克极简风)
* **图标库**：Lucide React
* **特效库**：Canvas Confetti
* **数学与可视化**：原生 SVG 贝塞尔曲线、HTML5 Canvas 2D 高频推断引擎、数值稳定矩阵计算

---

## 🚀 快速开始 (Quick Start)

### 1. 克隆代码到本地
```bash
git clone https://github.com/zhoul1/digit-to-transformer.git
cd digit-to-transformer
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动本地开发服务器
```bash
npm run dev
```
启动后在浏览器打开 `http://localhost:5173/` 即可尽情体验！

### 4. 生产打包构建
```bash
npm run build
```
产物将输出在 `dist/` 文件夹中，可直接部署在 Vercel, Netlify, GitHub Pages, Cloudflare Pages 等托管平台。

---

## 📄 开源许可证 (License)

本项目基于 [MIT License](LICENSE) 开源。欢迎 Star、Fork 与 PR！
