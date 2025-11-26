<div align="center">
<!-- You can add a logo here if available -->
<h1>🎓 Lalalearn - 通用游戏化学习平台</h1>
<p><em>让学习成为一场充满趣味的冒险！</em></p>
</div>

**Lalalearn** 是由 AI 驱动的通用游戏化学习平台，支持任意领域的知识培训。不同于传统学习软件，Lalalearn 采用闯关机制，将枯燥的知识点转化为有趣的挑战。

🚀 **最新版本**: MVP Demo v1.0 - Zeabur 员工培训专用版已发布！

---

## 🎯 项目状态

| 状态 | 版本 | 功能 |
|-----|------|------|
| ✅ 已完成 | **MVP Demo v1.0** | Zeabur 员工培训 (10 关卡) |
| 🔄 进行中 | **基础架构** | 通用题型系统、课程管理 |
| 📋 规划中 | **完整版本** | AI 内容生成、艾宾浩斯复习、数据分析 |

---

## 🌟 核心功能

### 1. 🎓 LLM Vibe 教授 (AI 智能导师)
- **动态人格**: 温柔保姆、严厉教授、幽默伙伴等多种教学风格
- **上下文感知**: 了解你的学习进度、当前关卡、历史表现
- **情绪共鸣**: 根据你的挫败感提供个性化的鼓励和指导

### 2. 📚 通用课程系统
支持多种学习类型和题型：
- **代码类课程**: Python 编程入门 (原版)
- **概念类课程**: 任意知识领域的概念学习
- **题型支持**: 单选题、多选题、判断题、填空题、配对题、代码编写

### 3. 🎮 游戏化体验
- **闯关机制**: 可视化进度地图，解锁式关卡
- **即时反馈**: 答题后立即显示结果和解释
- **成就系统**: 星星评分、XP 经验值、徽章奖励

### 4. 🚀 MVP Demo: Zeabur 员工培训
专为 Zeabur 市场/销售团队设计的培训课程：
- **10 张地图、100 关卡**: 按地图和难度标签展示，可筛选分组
- **逐关解锁机制**: 完成前一关才能解锁下一关
- **智能评分系统**: 按尝试次数降星（首次3星，错1次2星，错≥2次1星）
- **复盘面板**: 显示完成关卡/已获星数/正确率/错题列表/昨日学习时长
- **AI 教练总结**: 一键生成学习总结，分析薄弱点

---

## 🛠️ 技术架构

### 前端技术栈
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (样式)
- **Google Gemini** (AI 核心，通过 Zeabur AI Hub)

### 项目结构
```
/
├── 📁 components/
│   ├── LevelMap.tsx          # 关卡地图 (支持课程切换)
│   ├── questions/            # 题型组件
│   │   ├── QuestionRenderer.tsx
│   │   ├── SingleChoice.tsx     # 单选题
│   │   ├── TrueFalse.tsx        # 判断题
│   │   └── FillBlank.tsx        # 填空题
│   ├── CoachChat.tsx         # AI 导师聊天
│   └── VictoryModal.tsx      # 胜利弹窗
├── 📁 services/
│   └── geminiService.ts      # AI 服务 (Vibe 教授)
├── 📁 docs/                  # 完整设计文档
│   ├── 01_GAME_DESIGN_DOCUMENT.md
│   ├── 02_TECHNICAL_ARCHITECTURE.md
│   ├── 03_SDD_DEVELOPMENT_PLAN.md
│   ├── 04_MVP_DEMO_ZEABUR.md
│   └── 05_MVP_SDD_STEPS.md
├── constants.ts              # 课程数据 (Zeabur 培训)
├── types.ts                  # TypeScript 类型定义
└── App.tsx                   # 主应用逻辑
```

---

## 🚀 快速开始

### 🎮 体验 MVP Demo

1. **在线体验**:
   - 访问 [ZLearn Demo](https://zlearn-demo.vercel.app) (部署中)
   - 或本地运行体验

2. **本地运行**:
   ```bash
   # 克隆项目
   git clone https://github.com/fangligamedev/Lalalearn.git
   cd Lalalearn

   # 安装依赖
   npm install

   # 配置 AI 密钥 (可选，用于 AI 导师)
   echo "GEMINI_API_KEY=your_key_here" > .env.local

   # 启动开发服务器
   npm run dev
   ```

3. **选择课程**:
   - **"Python 少儿编程"**: 原版编程学习体验
   - **"Zeabur 云平台速成"**: 🆕 新增 - 10张地图、100关卡员工培训课程

---

## ☁️ 一键部署 (Zeabur)

本项目完美适配 **Zeabur** 平台：

1. **连接仓库**: 在 Zeabur 中选择 "Git Service"
2. **自动部署**: 代码推送后自动构建
3. **配置变量**: Settings → Environment Variables
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. **访问应用**: 获取自动分配的域名

---

## 📚 设计文档

项目包含完整的开发文档：

| 文档 | 内容 | 状态 |
|-----|------|------|
| [🎮 游戏设计文档](docs/01_GAME_DESIGN_DOCUMENT.md) | 核心玩法、关卡设计、激励系统 | ✅ 完成 |
| [🏗️ 技术架构文档](docs/02_TECHNICAL_ARCHITECTURE.md) | 系统设计、组件架构、数据存储 | ✅ 完成 |
| [📋 开发计划](docs/03_SDD_DEVELOPMENT_PLAN.md) | Phase 规划、迭代路线图 | ✅ 完成 |
| [🎯 MVP Demo 设计](docs/04_MVP_DEMO_ZEABUR.md) | Zeabur 培训课程详细设计 | ✅ 完成 |
| [⚡ SDD 开发步骤](docs/05_MVP_SDD_STEPS.md) | 具体实现步骤和代码规范 | ✅ 完成 |
| [📊 11月27日计划](docs/06_NOV27_CONTENT_IMPORT_ANALYTICS.md) | 内容导入 + 数据分析系统 | 📋 规划中 |

---

## 🔄 开发路线图

### Phase 1: MVP Demo ✅ 已完成
- [x] 概念题型组件 (单选/判断/填空)
- [x] Zeabur 培训课程 (10 张地图、100 关卡)
- [x] 课程切换功能
- [x] 地图/难度筛选和分组
- [x] 逐关解锁机制
- [x] 按尝试次数降星评分
- [x] 复盘面板 (完成关卡/星数/正确率/错题列表/昨日学习时长)
- [x] AI 教练 (专业严谨型 + 美嘉音色)
- [x] TTS 语音朗读功能

### Phase 2: 内容导入与数据分析 🔄 进行中 (11月27日)
- [ ] PDF/MD/URL 内容导入服务
- [ ] AI 课程生成 (可配置地图数/关卡数/难度分布)
- [ ] IndexedDB 数据持久化
- [ ] 游戏化埋点系统
- [ ] 留存分析引擎 (D1/D7/D30)
- [ ] 学习习惯分析
- [ ] Zeabur 数据备份方案

### Phase 3: 完整功能 📋 规划中
- [ ] 艾宾浩斯复习系统
- [ ] 网页内容爬虫
- [ ] 数据分析仪表盘
- [ ] 语音交互功能

### Phase 4: 企业级功能 🚀 远期规划
- [ ] 组织管理后台
- [ ] 多课程进度追踪
- [ ] 团队学习统计
- [ ] 自定义课程编辑器

---

## 🤝 贡献指南

欢迎参与 Lalalearn 的开发！

1. **Fork** 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 发起 **Pull Request**

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙋‍♂️ 关于作者

**Bruce Fang** - AI 产品架构师 & 游戏化学习探索者

- 💼 专注于将 AI 与游戏化学习结合
- 🎯 致力于让学习变得更有趣、更有效
- 🌟 相信技术可以改变教育方式

**联系方式**:
- GitHub: [@fangligamedev](https://github.com/fangligamedev)
- 项目主页: [Lalalearn](https://github.com/fangligamedev/Lalalearn)

---

## 🎉 致谢

感谢 **Zeabur** 提供优秀的 AI Hub 和部署平台，让这个项目成为可能！

特别感谢所有参与测试和反馈的用户，你们让 Lalalearn 变得更好！

---

<div align="center">

**让学习成为一种享受！** 🎓✨

[🚀 立即体验](https://github.com/fangligamedev/Lalalearn) • [📖 设计文档](docs/) • [🐛 报告问题](https://github.com/fangligamedev/Lalalearn/issues)

</div>
