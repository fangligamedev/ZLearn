<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Pysparky Magic Academy - 项目全解与部署手册

本文档详细说明了 Pysparky Magic Academy 的架构设计、AI 提示词工程 (Prompt Engineering) 实现细节以及在 Zeabur 上的部署流程。

---

## 1. 项目概览

**Pysparky Magic Academy** 是一个基于 React 的互动式 Python 学习平台，专为编程初学者设计。它不仅仅是一个代码编辑器，更引入了基于 Google Gemini 的 "AI 导师 (Sparky)"，能够像真人一样实时批改作业、提供个性化指导，并根据用户选择表现出不同的性格。

### 核心技术栈
- **前端核心**: React 18, TypeScript, Vite
- **UI 风格**: Tailwind CSS (或是自定义 CSS Modules，视具体实现而定)
- **AI 驱动**: Google Gemini Pro/Flash (通过 Zeabur AI Hub 接入)
- **部署环境**: Zeabur (Static Site Hosting)

---

## 2. 核心架构解析

项目代码结构清晰，主要分为展示层、业务逻辑层和 AI 服务层。

```text
/
├── components/          # [展示层] UI 组件库
│   ├── CoachChat.tsx    # AI 导师对话框 - 负责展示聊天记录和发送消息
│   ├── CodeEditor.tsx   # 代码编辑器 - 带有语法高亮的输入区域
│   ├── LevelMap.tsx     # 关卡选择地图 - 游戏化的进度展示
│   └── ...              # 各类模态框 (胜利、失败、排行榜)
│
├── services/            # [服务层] 核心业务逻辑
│   └── geminiService.ts # AI 通信模块 - 封装了所有的 Prompt Engineering 和 API 调用
│
├── types.ts             # [类型定义] TypeScript 接口定义 (LevelData, UserState 等)
├── constants.ts         # [数据层] 静态数据 (题库、AI 人格设定、音效链接)
├── App.tsx              # [应用入口] 全局状态管理 (路由、用户进度、设置)
└── vite.config.ts       # [构建配置] Vite 配置
```

---

## 3. AI Studio 提示词工程 (Prompt Engineering)

本项目的核心亮点在于如何让通用大模型 (LLM) 扮演特定的教育角色。我们在 `services/geminiService.ts` 中实现了两套核心的提示词系统。

### 3.1 代码判题系统 (The Validator Persona)

**目标**: 让 AI 扮演一个"严格但友好的 Python 解释器"。它不仅要判断代码对错，还要模拟代码运行结果。

**实现策略**:
我们构建了一个结构化的 Prompt，强制模型返回 JSON 格式，以便前端解析。

**Prompt 模板**:
```text
Language: [Chinese/English]
Task: [当前关卡任务描述]

User's Python Code:
```python
[用户编写的代码]
```

Act as a strict Python Interpreter.

1. If syntax/runtime errors:
   - success: false
   - output: [模拟真实的 Python Traceback 报错信息]
   - feedback: [用简单语言解释错误原因]

2. If logic is wrong (runs but fails task):
   - success: false
   - output: [模拟代码的实际输出]
   - feedback: [解释为何逻辑不符合任务要求]

3. If correct:
   - success: true
   - output: [模拟输出]
   - feedback: [简短的夸奖]

Respond in JSON format: { "success": boolean, "output": string, "feedback": string }
```

**工程亮点**:
- **JSON Mode**: 强制要求 JSON 输出，解决了 LLM 废话过多的问题，便于程序直接读取 `success` 状态。
- **Output Simulation**: 即使是在浏览器端，我们也没有引入沉重的 Python 运行时 (如 Pyodide)，而是让 LLM "想象" 代码的运行结果。对于初学者级别的简单代码，Gemini 的模拟准确率极高且响应极快。

### 3.2 AI 导师系统 (The Coach Persona)

**目标**: 提供一个有个性、有记忆的编程导师。

**实现策略**:
我们采用了 **System Instruction Injection (系统指令注入)** 和 **Context Awareness (上下文感知)** 技术。

**动态人格 (Dynamic Persona)**:
在 `constants.ts` 中定义了 5 种不同的人格 Prompt，用户可以在设置中实时切换：
- **Gentle**: "Nanny-like tutor", 充满爱心和表情符号。
- **Sarcastic**: "Funny, slightly sarcastic robot", 会温和地嘲讽用户。
- **Professional**: "CS Professor", 严谨、学术。
- **Concise**: 极简主义，只说重点。
- **Step-by-Step**: 把每一步都拆解得非常细致。

**上下文感知 (Context Injection)**:
每次对话时，我们不仅仅发送用户的最新问题，还会悄悄附带当前的 "游戏状态"：
```text
[System Instruction]
You are Sparky. Personality: [当前选择的人格Prompt]
Language: Chinese.

[Game Context]
Level: 第3关 - 变量计算
Task: 创建一个变量 score 并赋值 100
User XP: 350
User's Code:
```python
scroe = 100  # 用户当前的错误代码
```

User: 我哪里错了？
```
**效果**: 即使其实用户只问了一句"我哪里错了"，AI 因为看到了 Context 中的 `scroe` 拼写错误和当前任务，能立刻回答："你看，你把 score 拼成了 scroe，导致变量没定义哦。"

---

## 4. Zeabur 部署指南

本项目推荐使用 **Static Site (静态站点)** 模式部署，配合 Zeabur AI Hub 使用。

### 4.1 部署前准备
确保代码已提交到 GitHub 仓库。

### 4.2 部署步骤
1. 登录 Zeabur Dashboard。
2. 创建新服务 (Service) -> 选择 GitHub 仓库。
3. Zeabur 会自动识别为静态网站 (基于 Vite)。

### 4.3 关键配置：环境变量

**这是 AI 功能能否正常工作的关键。**

在 Zeabur 服务的 **Settings (设置)** -> **Environment Variables (环境变量)** 中添加：

| 变量名 (Key) | 变量值 (Value) | 说明 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `sk-ASF7dpKfeIAmBQdrgSNjQA` | Zeabur AI Hub 分配的 API 密钥 |

*注意：添加环境变量后，请务必点击 Redeploy (重新部署) 以生效。*

---

## 5. 故障排查 (Troubleshooting)

### Q: 为什么部署状态显示 "NotTriggerScaleUp" 或 "Crashed"?
**A**: 这是因为 Zeabur 试图以 Node.js 后端服务启动项目，但项目实际上是纯静态前端。
**Fix**: 检查 `package.json`。确保**没有** `"start": "node ..."` 或类似的启动脚本。我们已经移除了 `start` 脚本，Zeabur 现已能正确识别为静态站点托管。

### Q: 聊天功能为何没有反应？
**A**: Gemini API 的 `startChat` 接口在某些代理环境下可能存在状态丢失问题。
**Fix**: 我们在 `geminiService.ts` 中重构了聊天逻辑。现在每次发送消息，我们都会手动构建完整的 `History + System Prompt + New Message` 组合，使用无状态的 `generateContent` 接口。这确保了 AI 总是知道自己的"导师"身份，且对话极其稳定。

### Q: 本地开发如何配置？
1. 在根目录新建 `.env.local`。
2. 写入 `GEMINI_API_KEY=your_key_here`。
3. 运行 `npm run dev`。
