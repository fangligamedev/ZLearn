
import { LevelData, Language, CoachPersona, Course, ConceptLevel } from './types';

export const LEVEL_COUNT = 10;

// SFX Placeholders
export const SFX = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  LOSE: 'https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3',
  TICK: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', 
  START: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
};

// --- QUESTION BANKS ---

// BANK A: Standard
const LEVELS_A_ZH: LevelData[] = [
  {
    id: 1,
    title: "魔法问候 (A卷)",
    description: "派对开始了！向你的对手打个招呼！",
    task: "打印 'Hello Party' 到屏幕上。",
    starterCode: "# 比赛开始！\n",
    concepts: ["print"],
    hint: "print('Hello Party')",
    timeLimit: 60,
    variants: [
      { task: "打印 'Hello Party' 到屏幕上。", starterCode: "# 比赛开始！\n", hint: "print('Hello Party')" },
      { task: "打印 'Python Is Fun' 到屏幕上。", starterCode: "# 写下代码\n", hint: "print('Python Is Fun')" },
      { task: "打印 'I Am Ready' 到屏幕上。", starterCode: "# 准备好了吗\n", hint: "print('I Am Ready')" }
    ]
  },
  {
    id: 2,
    title: "计分板 (A卷)",
    description: "我们需要一个变量来记录分数。",
    task: "创建一个变量 `score` 并赋值为 100，然后打印它。",
    starterCode: "# 创建变量\n",
    concepts: ["变量"],
    hint: "score = 100\nprint(score)",
    timeLimit: 60,
    variants: [
      { task: "创建变量 `score` 并赋值为 100，然后打印。", starterCode: "# 创建变量\n", hint: "score = 100\nprint(score)" },
      { task: "创建变量 `points` 并赋值为 500，然后打印。", starterCode: "# 记录分数\n", hint: "points = 500\nprint(points)" },
      { task: "创建变量 `gold` 并赋值为 999，然后打印。", starterCode: "# 多少金币？\n", hint: "gold = 999\nprint(gold)" }
    ]
  },
  {
    id: 3,
    title: "双倍快乐 (A卷)",
    description: "如果是派对模式，分数要翻倍！",
    task: "计算 100 * 2 并打印结果。",
    starterCode: "",
    concepts: ["数学"],
    hint: "print(100 * 2)",
    timeLimit: 45,
    variants: [
      { task: "计算 100 * 2 并打印结果。", starterCode: "", hint: "print(100 * 2)" },
      { task: "计算 50 * 4 并打印结果。", starterCode: "", hint: "print(50 * 4)" },
      { task: "计算 10 + 10 + 10 并打印结果。", starterCode: "", hint: "print(10 + 10 + 10)" }
    ]
  },
  { id: 4, title: "字符串拼接", description: "把两个单词连起来。", task: "打印 'Super' + 'Star'。", starterCode: "", concepts: ["字符串"], hint: "print('Super' + 'Star')", timeLimit: 45 },
  { id: 5, title: "年龄计算", description: "计算你的年龄的一半。", task: "打印 10 / 2。", starterCode: "", concepts: ["除法"], hint: "print(10 / 2)", timeLimit: 45 },
  { id: 6, title: "判断大小", description: "100 比 50 大吗？", task: "打印 100 > 50。", starterCode: "", concepts: ["布尔值"], hint: "print(100 > 50)", timeLimit: 45 },
  { id: 7, title: "循环三次", description: "喊三声加油。", task: "使用 for 循环打印 'Go' 3次。", starterCode: "", concepts: ["循环"], hint: "for i in range(3): print('Go')", timeLimit: 60 },
  { id: 8, title: "我的清单", description: "列出两个水果。", task: "创建列表 ['Apple', 'Banana'] 并打印。", starterCode: "", concepts: ["列表"], hint: "print(['Apple', 'Banana'])", timeLimit: 60 },
  { id: 9, title: "自定义函数", description: "定义一个函数。", task: "定义 func() 打印 'Hi'，然后调用它。", starterCode: "", concepts: ["函数"], hint: "def func(): print('Hi')\nfunc()", timeLimit: 90 },
  { id: 10, title: "最终挑战", description: "综合运用！", task: "如果 5 > 3，打印 'Win'。", starterCode: "", concepts: ["逻辑"], hint: "if 5 > 3: print('Win')", timeLimit: 90 },
];

// BANK B: Speed (Math Focus)
const LEVELS_B_ZH: LevelData[] = [
  {
    id: 1,
    title: "极速问候 (B卷)",
    description: "只有最快的手速才能获胜！",
    task: "打印 'Go Go Go' 到屏幕上。",
    starterCode: "# 快！\n",
    concepts: ["print"],
    hint: "print('Go Go Go')",
    timeLimit: 30
  },
  {
    id: 2,
    title: "队伍名称 (B卷)",
    description: "给你的队伍起个名字。",
    task: "创建变量 `team` 赋值为 'Tigers'，并打印。",
    starterCode: "",
    concepts: ["变量"],
    hint: "team = 'Tigers'\nprint(team)",
    timeLimit: 45
  },
  {
    id: 3,
    title: "混合运算 (B卷)",
    description: "你需要计算 50 加 50 再减去 10。",
    task: "计算 50 + 50 - 10 并打印。",
    starterCode: "",
    concepts: ["混合运算"],
    hint: "print(50 + 50 - 10)",
    timeLimit: 45
  },
  { id: 4, title: "乘法挑战", description: "计算 12 乘以 12。", task: "打印 12 * 12。", starterCode: "", concepts: ["乘法"], hint: "print(12 * 12)", timeLimit: 30 },
  { id: 5, title: "取余数", description: "10 除以 3 的余数是多少？", task: "打印 10 % 3。", starterCode: "", concepts: ["取模"], hint: "print(10 % 3)", timeLimit: 45 },
  { id: 6, title: "等于判断", description: "1 加 1 等于 2 吗？", task: "打印 1 + 1 == 2。", starterCode: "", concepts: ["比较"], hint: "print(1 + 1 == 2)", timeLimit: 45 },
  { id: 7, title: "倒计时循环", description: "从0打印到4。", task: "使用 for i in range(5) 打印 i。", starterCode: "", concepts: ["循环"], hint: "for i in range(5): print(i)", timeLimit: 60 },
  { id: 8, title: "数字列表", description: "创建一个包含 1, 2, 3 的列表。", task: "创建列表 [1, 2, 3] 并打印。", starterCode: "", concepts: ["列表"], hint: "print([1, 2, 3])", timeLimit: 60 },
  { id: 9, title: "加法函数", description: "定义函数 add(a, b) 返回和。", task: "定义 add(a, b) 返回 a+b，并打印 add(1, 2)。", starterCode: "", concepts: ["函数"], hint: "def add(a,b): return a+b\nprint(add(1,2))", timeLimit: 90 },
  { id: 10, title: "终极算术", description: "计算 (10+10)*5。", task: "计算并打印 (10+10)*5。", starterCode: "", concepts: ["运算"], hint: "print((10+10)*5)", timeLimit: 60 },
];

// BANK C: Creative
const LEVELS_C_ZH: LevelData[] = [
  {
    id: 1,
    title: "神秘代码 (C卷)",
    description: "让我们像黑客一样开始。",
    task: "打印数字 007。",
    starterCode: "",
    concepts: ["print", "数字"],
    hint: "print(7)",
    timeLimit: 60
  },
  {
    id: 2,
    title: "我的名字 (C卷)",
    description: "告诉裁判你是谁。",
    task: "创建变量 `me` 存储你的名字(字符串)，并打印。",
    starterCode: "",
    concepts: ["变量"],
    hint: "me = 'Alice'\nprint(me)",
    timeLimit: 60
  },
   {
    id: 3,
    title: "倒计时 (C卷)",
    description: "还剩3秒！",
    task: "使用 print 打印 3，然后下一行打印 2，再下一行打印 1。",
    starterCode: "",
    concepts: ["多行打印"],
    hint: "print(3)\nprint(2)\nprint(1)",
    timeLimit: 50
  },
  { id: 4, title: "大写转换", description: "把 'abc' 变成大写。", task: "打印 'abc'.upper()。", starterCode: "", concepts: ["字符串方法"], hint: "print('abc'.upper())", timeLimit: 45 },
  { id: 5, title: "字符串长度", description: "单词 'Python' 有几个字母？", task: "打印 len('Python')。", starterCode: "", concepts: ["len"], hint: "print(len('Python'))", timeLimit: 45 },
  { id: 6, title: "如果不等于", description: "如果 1 不等于 2。", task: "打印 1 != 2。", starterCode: "", concepts: ["比较"], hint: "print(1 != 2)", timeLimit: 45 },
  { id: 7, title: "while循环", description: "无限循环太危险，只打印一次。", task: "i=1; while i<2: print(i); i=i+1", starterCode: "", concepts: ["while"], hint: "i=1\nwhile i<2:\n print(i)\n i+=1", timeLimit: 90 },
  { id: 8, title: "混合列表", description: "列表包含数字和字符串。", task: "打印 [1, 'a']。", starterCode: "", concepts: ["列表"], hint: "print([1, 'a'])", timeLimit: 60 },
  { id: 9, title: "问候函数", description: "定义 greet(name)。", task: "定义 greet(name) 打印 name，调用 greet('Hi')。", starterCode: "", concepts: ["函数"], hint: "def greet(n): print(n)\ngreet('Hi')", timeLimit: 90 },
  { id: 10, title: "密码检查", description: "如果 pw 是 '123' 打印 OK。", task: "pw='123'; if pw=='123': print('OK')", starterCode: "", concepts: ["逻辑"], hint: "pw='123'\nif pw=='123': print('OK')", timeLimit: 90 },
];

// Helper to ensure banks exist for other languages (fallback to ZH for demo if EN missing)
const fillLevels = (base: LevelData[]) => base;

export const QUESTION_BANKS = {
  zh: {
    A: fillLevels(LEVELS_A_ZH),
    B: fillLevels(LEVELS_B_ZH),
    C: fillLevels(LEVELS_C_ZH),
  },
  en: {
    A: fillLevels(LEVELS_A_ZH), 
    B: fillLevels(LEVELS_B_ZH),
    C: fillLevels(LEVELS_C_ZH),
  }
};

export const getLevels = (lang: Language, bank: 'A'|'B'|'C' = 'A') => {
  return QUESTION_BANKS[lang][bank];
};

export const COACH_PERSONAS: Record<CoachPersona, string> = {
  gentle: "You are a very gentle, patient, and sweet Nanny-like tutor. Use lots of hearts and soft language.",
  sarcastic: "You are a funny, slightly sarcastic robot. You tease the user playfully about their code but still help them.",
  professional: "You are a serious, professional computer science professor. Be precise, concise, and academic.",
  concise: "You are extremely efficient. Give shortest possible hints. No fluff.",
  stepbystep: "You are a methodical guide. Always break down instructions into Step 1, Step 2, Step 3.",
  mentor: "You are a professional, concise instructor. Give direct guidance, highlight key docs points, avoid small talk."
};

export const UI_STRINGS = {
  en: {
    appTitle: "ZLearn Quest",
    xp: "XP",
    mapBtn: "Map",
    resetBtn: "Reset",
    runBtn: "Run",
    casting: "Compiling...",
    outputTitle: "Terminal Output",
    success: "Success",
    tryAgain: "Runtime Error",
    placeholder: "# Type your code here...",
    mission: "Mission",
    coachTitle: "ZLearn Coach",
    coachSubtitle: "Virtual Coach",
    thinking: "Thinking...",
    chatPlaceholder: "Ask for help...",
    welcomeChat: "Ready for the competition? The clock is ticking! ⏱️",
    backToMap: "Back to Map",
    running: "Executing...",
    playNow: "START",
    locked: "LOCKED",
    completed: "DONE",
    mapTitle: "Tournament Map",
    microphoneError: "Voice input not supported.",
    tapToSpeak: "Speak",
    listening: "Listening...",
    settings: "Settings",
    voice: "Voice",
    testVoice: "Test",
    persona: "Coach Style",
    personas: {
      gentle: "Gentle",
      sarcastic: "Sarcastic",
      professional: "Pro",
      concise: "Concise",
      stepbystep: "Step-by-Step"
    },
    tutorial: {
      welcome: "Welcome to PySparky Party Mode! 🏆 It's time to compete!",
      map: "Select a level. Be fast! Time affects your score.",
      editor: "Write code here.",
      run: "Run to score points.",
      chat: "Ask for help (but it takes time!).",
      next: "Next",
      finish: "Let's Party!"
    },
    victory: {
      title: "STAGE CLEARED!",
      subtitle: "Amazing performance!",
      nextLevel: "Map",
      replay: "Replay",
      stars: "Rating",
      score: "TOTAL SCORE",
      timeBonus: "Time Bonus",
      baseScore: "Base Score"
    },
    bankSelector: "Question Bank",
    leaderboard: "Leaderboard",
    switchUser: "Switch Player",
    newUser: "New Player",
    selectUser: "Who is playing?",
    create: "Create",
    rank: "Rank",
    player: "Player",
    totalScore: "Total Score"
  },
  zh: {
    appTitle: "ZLearn 答题闯关",
    xp: "总分",
    mapBtn: "地图",
    resetBtn: "重置",
    runBtn: "提交运行",
    casting: "编译中...",
    outputTitle: "裁判终端 (Terminal)",
    success: "运行成功",
    tryAgain: "运行失败",
    placeholder: "# 比赛倒计时中...输入代码...",
    mission: "本关任务",
    coachTitle: "ZLearn 智能教练",
    coachSubtitle: "AI 导师",
    thinking: "裁判判定中...",
    chatPlaceholder: "请求提示 (不扣分)...",
    welcomeChat: "准备好比赛了吗？时间紧迫，只有最快的程序员才能获胜！⏱️",
    backToMap: "返回大厅",
    running: "执行中...",
    playNow: "挑战",
    locked: "锁定",
    completed: "已完成",
    mapTitle: "竞技场地图",
    microphoneError: "不支持语音。",
    tapToSpeak: "点击说话",
    listening: "正在听...",
    settings: "设置",
    voice: "裁判音色",
    testVoice: "试听",
    persona: "裁判风格",
    personas: {
      gentle: "温柔鼓励型",
      sarcastic: "毒舌压力型",
      professional: "专业严谨型",
      concise: "极速效率型",
      stepbystep: "新手引导型"
    },
    tutorial: {
      welcome: "欢迎来到 PySparky 派对模式！🏆 这是一个拼速度和准确率的游戏！",
      map: "这是比赛地图。每关都有时间限制，越快分数越高！",
      editor: "在这里编写你的胜利用代码！",
      run: "点击运行来提交答案，争取一次过！",
      chat: "如果卡住了可以问我，但我可能会嘲讽你哦。",
      next: "下一步",
      finish: "开始比赛！"
    },
    victory: {
      title: "挑战成功！",
      subtitle: "表现太棒了！",
      nextLevel: "返回地图",
      replay: "重试刷分",
      stars: "评级",
      score: "本局得分",
      timeBonus: "时间奖励",
      baseScore: "基础得分"
    },
    bankSelector: "当前题库",
    leaderboard: "排行榜",
    switchUser: "切换选手",
    newUser: "新选手",
    selectUser: "谁在挑战？",
    create: "创建",
    rank: "排名",
    player: "选手",
    totalScore: "总积分"
  }
};

// ============================================================
// Zeabur 培训课程
// ============================================================

const ZEABUR_LEVELS: ConceptLevel[] = [
  // Map 1 平台概览
  { id: 1, map: 'M1 平台概览', difficulty: 'easy', title: '什么是 Zeabur', description: '了解 Zeabur 的基本定位', type: 'concept', questions: [{ type: 'single_choice', question: 'Zeabur 是什么类型的平台？', options: [{ key: 'A', text: '社交媒体平台' }, { key: 'B', text: '应用部署与托管平台' }, { key: 'C', text: '电商购物平台' }, { key: 'D', text: '视频流媒体平台' }], correctAnswer: 'B', explanation: 'Zeabur 帮助开发者快速部署和托管应用。' }] },
  { id: 2, map: 'M1 平台概览', difficulty: 'easy', title: '适用人群', description: '了解 Zeabur 面向的角色', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 只面向后端工程师使用。', correctAnswer: false, explanation: '市场、前端、后端、独立开发者都可用。' }] },
  { id: 3, map: 'M1 平台概览', difficulty: 'medium', title: '核心优势', description: '掌握开箱即用和按量计费', type: 'concept', questions: [{ type: 'single_choice', question: 'Zeabur 的突出优势是？', options: [{ key: 'A', text: '固定月费且需手动 CI/CD' }, { key: 'B', text: '按量计费+自动识别项目' }, { key: 'C', text: '只支持 Docker 手工部署' }, { key: 'D', text: '需要自建服务器' }], correctAnswer: 'B', explanation: '自动构建/部署，按量计费，降低初期成本。' }] },
  { id: 4, map: 'M1 平台概览', difficulty: 'medium', title: '支持的技术栈', description: '语言与框架覆盖', type: 'concept', questions: [{ type: 'single_choice', question: '下列哪一项不是 Zeabur 支持的技术栈？', options: [{ key: 'A', text: 'Node.js' }, { key: 'B', text: 'Python' }, { key: 'C', text: 'Go' }, { key: 'D', text: '只能 PHP' }], correctAnswer: 'D', explanation: 'Zeabur 支持 Node.js/Python/Go/Java/Rust 等。' }] },
  { id: 5, map: 'M1 平台概览', difficulty: 'medium', title: '产品形态', description: '了解 SaaS 化控制台', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 提供可视化控制台和 API/CLI 两种操作方式。', correctAnswer: true, explanation: '控制台+CLI/Deploy Button 等入口。' }] },
  { id: 6, map: 'M1 平台概览', difficulty: 'hard', title: '场景匹配', description: '选择合适的使用场景', type: 'concept', questions: [{ type: 'single_choice', question: '适合使用 Zeabur 的场景是？', options: [{ key: 'A', text: '需要自管物理机的 HPC 场景' }, { key: 'B', text: '快速上线 SaaS/小程序/静态站' }, { key: 'C', text: '只能本地运行的离线任务' }, { key: 'D', text: '仅数据库托管' }], correctAnswer: 'B', explanation: 'Zeabur 适合快速发布 Web/后端/静态站。' }] },
  { id: 7, map: 'M1 平台概览', difficulty: 'hard', title: '计费模型概览', description: '费用组成要素', type: 'concept', questions: [{ type: 'fill_blank', question: 'Zeabur 的费用主要按 ____ 计费。', correctAnswers: ['资源用量', '实例资源', 'CPU 和内存'], explanation: '按资源用量（CPU/内存/带宽）与存储等计费。' }] },
  { id: 8, map: 'M1 平台概览', difficulty: 'expert', title: '对比自建方案', description: '优势劣势快速判断', type: 'concept', questions: [{ type: 'true_false', statement: '与自建 K8s 相比，Zeabur 减少了集群维护成本。', correctAnswer: true, explanation: 'SaaS 托管，免集群维护。' }] },
  { id: 9, map: 'M1 平台概览', difficulty: 'expert', title: '开箱能力', description: '默认提供的运维能力', type: 'concept', questions: [{ type: 'single_choice', question: '以下哪项是 Zeabur 默认提供的？', options: [{ key: 'A', text: '日志与指标面板' }, { key: 'B', text: '自管防火墙规则编排' }, { key: 'C', text: '手写部署脚本' }, { key: 'D', text: '自带私有机房' }], correctAnswer: 'A', explanation: '控制台内置日志、指标和发布管理。' }] },
  { id: 10, map: 'M1 平台概览', difficulty: 'expert', title: '综合测验', description: '总结平台核心卖点', type: 'concept', questions: [{ type: 'single_choice', question: '一句话介绍 Zeabur，最准确的是？', options: [{ key: 'A', text: '手工配置的 VPS 托管' }, { key: 'B', text: '按量计费、自动识别项目的云原生部署平台' }, { key: 'C', text: '仅限静态站的 CDN 平台' }, { key: 'D', text: '只提供数据库托管' }], correctAnswer: 'B', explanation: '核心：自动化构建/部署 + 按量计费 + 多语言。' }] },

  // Map 2 计费与配额
  { id: 11, map: 'M2 计费与配额', difficulty: 'easy', title: '计费模式', description: '按量计费概念', type: 'concept', questions: [{ type: 'single_choice', question: 'Zeabur 默认计费是？', options: [{ key: 'A', text: '固定月费' }, { key: 'B', text: '按量计费' }, { key: 'C', text: '终身买断' }, { key: 'D', text: '只收带宽费' }], correctAnswer: 'B', explanation: '按资源使用计费。' }] },
  { id: 12, map: 'M2 计费与配额', difficulty: 'easy', title: '免费额度', description: '了解试用额度', type: 'concept', questions: [{ type: 'true_false', statement: '新账户可能有试用额度，可在控制台查看。', correctAnswer: true, explanation: '控制台账单页可查看赠送额度。' }] },
  { id: 13, map: 'M2 计费与配额', difficulty: 'medium', title: '资源项', description: 'CPU/内存/带宽计费要素', type: 'concept', questions: [{ type: 'single_choice', question: '下列哪项通常影响计费？', options: [{ key: 'A', text: 'CPU 与内存' }, { key: 'B', text: '代码行数' }, { key: 'C', text: 'Git 提交次数' }, { key: 'D', text: '编辑器主题' }], correctAnswer: 'A', explanation: '主要按资源规格与运行时长计费。' }] },
  { id: 14, map: 'M2 计费与配额', difficulty: 'medium', title: '配额超限', description: '超限处理方式', type: 'concept', questions: [{ type: 'true_false', statement: '资源超限后服务会被自动扩容且免费。', correctAnswer: false, explanation: '超限需升级或调整资源，否则可能限流/失败。' }] },
  { id: 15, map: 'M2 计费与配额', difficulty: 'medium', title: '带宽与流量', description: '出站流量计费', type: 'concept', questions: [{ type: 'single_choice', question: '流量计费主要关注哪一项？', options: [{ key: 'A', text: '出站流量' }, { key: 'B', text: '本地磁盘 IO' }, { key: 'C', text: '终端行数' }, { key: 'D', text: 'Git 分支数' }], correctAnswer: 'A', explanation: '大部分云计费以出站流量为主。' }] },
  { id: 16, map: 'M2 计费与配额', difficulty: 'hard', title: '实例休眠', description: '空闲实例策略', type: 'concept', questions: [{ type: 'true_false', statement: '无流量时服务会按策略休眠以节省费用。', correctAnswer: true, explanation: '自动休眠/冷启动策略可降低成本。' }] },
  { id: 17, map: 'M2 计费与配额', difficulty: 'hard', title: '计费可见性', description: '账单与用量查看', type: 'concept', questions: [{ type: 'fill_blank', question: '账单与用量可在控制台的 ____ 页面查看。', correctAnswers: ['Billing', '账单'], explanation: '控制台账单/用量页。' }] },
  { id: 18, map: 'M2 计费与配额', difficulty: 'hard', title: '成本优化', description: '降低费用的方法', type: 'concept', questions: [{ type: 'single_choice', question: '下列哪项有助于降低成本？', options: [{ key: 'A', text: '降低实例规格' }, { key: 'B', text: '增加日志级别为 DEBUG' }, { key: 'C', text: '关闭休眠功能' }, { key: 'D', text: '频繁重启服务' }], correctAnswer: 'A', explanation: '减小规格或开启休眠可省成本。' }] },
  { id: 19, map: 'M2 计费与配额', difficulty: 'expert', title: '跨区域计费', description: '多 Region 考量', type: 'concept', questions: [{ type: 'true_false', statement: '跨 Region 数据传输可能产生额外费用。', correctAnswer: true, explanation: '跨区流量需额外计费。' }] },
  { id: 20, map: 'M2 计费与配额', difficulty: 'expert', title: '综合测验', description: '计费策略理解', type: 'concept', questions: [{ type: 'single_choice', question: '若要降低成本，下列组合最合理？', options: [{ key: 'A', text: '减小规格+允许休眠' }, { key: 'B', text: '放大规格+关闭休眠' }, { key: 'C', text: '增加日志量' }, { key: 'D', text: '强制常驻高负载' }], correctAnswer: 'A', explanation: '减小规格并开启休眠可控成本。' }] },

  // Map 3 部署入口
  { id: 21, map: 'M3 部署入口', difficulty: 'easy', title: 'Git Service', description: '从仓库一键部署', type: 'concept', questions: [{ type: 'fill_blank', question: 'Zeabur 的 ____ Service 支持从 GitHub/GitLab 部署。', correctAnswers: ['Git'], explanation: 'Git Service 连接仓库自动部署。' }] },
  { id: 22, map: 'M3 部署入口', difficulty: 'easy', title: 'Deploy Button', description: 'README 一键部署', type: 'concept', questions: [{ type: 'single_choice', question: '在 README 添加 Deploy to Zeabur 按钮需要提供什么链接？', options: [{ key: 'A', text: '代码 zip' }, { key: 'B', text: 'Zeabur Deploy 链接' }, { key: 'C', text: '数据库导出' }, { key: 'D', text: '本地路径' }], correctAnswer: 'B', explanation: '按钮指向 Zeabur 的部署链接。' }] },
  { id: 23, map: 'M3 部署入口', difficulty: 'medium', title: 'Docker Image', description: '自带镜像部署', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 支持直接使用 Docker 镜像部署。', correctAnswer: true, explanation: '可选镜像作为运行基础。' }] },
  { id: 24, map: 'M3 部署入口', difficulty: 'medium', title: '预构建模板', description: '模板快速启动', type: 'concept', questions: [{ type: 'single_choice', question: '想快速启动 PostgreSQL，应该选择？', options: [{ key: 'A', text: '预构建模板' }, { key: 'B', text: '手写 Dockerfile' }, { key: 'C', text: '本地 SQLite' }, { key: 'D', text: '导入 CSV' }], correctAnswer: 'A', explanation: '预构建模板提供常用数据库。' }] },
  { id: 25, map: 'M3 部署入口', difficulty: 'medium', title: '自动识别', description: '框架检测', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 会自动识别常见框架并设置构建命令。', correctAnswer: true, explanation: '内置检测多语言框架。' }] },
  { id: 26, map: 'M3 部署入口', difficulty: 'hard', title: '多服务项目', description: 'Monorepo 部署', type: 'concept', questions: [{ type: 'single_choice', question: 'Monorepo 中选择部署子目录可通过？', options: [{ key: 'A', text: '在控制台选子目录' }, { key: 'B', text: '删除其他目录' }, { key: 'C', text: '压缩上传' }, { key: 'D', text: '不支持 monorepo' }], correctAnswer: 'A', explanation: '控制台可指定子目录。' }] },
  { id: 27, map: 'M3 部署入口', difficulty: 'hard', title: '构建缓存', description: '加速二次构建', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 支持构建缓存以加速重复部署。', correctAnswer: true, explanation: '缓存依赖缩短构建时间。' }] },
  { id: 28, map: 'M3 部署入口', difficulty: 'hard', title: '私有仓库', description: '授权访问私有 Git', type: 'concept', questions: [{ type: 'single_choice', question: '部署私有仓库需确保？', options: [{ key: 'A', text: '仓库公开' }, { key: 'B', text: '配置访问令牌/授权' }, { key: 'C', text: '删除 .git' }, { key: 'D', text: '改名 master' }], correctAnswer: 'B', explanation: '需授权访问私库。' }] },
  { id: 29, map: 'M3 部署入口', difficulty: 'expert', title: '自定义流程', description: '自定义构建命令', type: 'concept', questions: [{ type: 'fill_blank', question: '自定义构建命令可在控制台的 ____ 里配置。', correctAnswers: ['Build & Deploy', '构建与部署', '构建设置'], explanation: '构建设置中可改命令。' }] },
  { id: 30, map: 'M3 部署入口', difficulty: 'expert', title: '综合测验', description: '部署入口汇总', type: 'concept', questions: [{ type: 'single_choice', question: '最快让用户一键部署你的开源项目的方式是？', options: [{ key: 'A', text: '上传 zip' }, { key: 'B', text: '在 README 添加 Deploy to Zeabur 按钮' }, { key: 'C', text: '手写脚本邮件给用户' }, { key: 'D', text: '提供本地 exe' }], correctAnswer: 'B', explanation: 'Deploy Button 是最便捷入口。' }] },

  // Map 4 构建与运行时
  { id: 31, map: 'M4 构建与运行时', difficulty: 'easy', title: '构建命令', description: '默认构建命令了解', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 会根据框架自动填入构建命令，可手动修改。', correctAnswer: true, explanation: '自动识别但可覆盖。' }] },
  { id: 32, map: 'M4 构建与运行时', difficulty: 'easy', title: '启动命令', description: '运行命令配置', type: 'concept', questions: [{ type: 'single_choice', question: 'Node.js 服务启动命令常见设置为？', options: [{ key: 'A', text: 'npm start' }, { key: 'B', text: 'python app.py' }, { key: 'C', text: 'go test ./...' }, { key: 'D', text: 'ls' }], correctAnswer: 'A', explanation: '常用 npm start/pm2 等。' }] },
  { id: 33, map: 'M4 构建与运行时', difficulty: 'medium', title: '环境变量注入', description: '构建时与运行时变量', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 支持在构建时注入环境变量。', correctAnswer: true, explanation: '可区分构建/运行时变量。' }] },
  { id: 34, map: 'M4 构建与运行时', difficulty: 'medium', title: '运行时端口', description: 'PORT 绑定', type: 'concept', questions: [{ type: 'single_choice', question: '服务应监听的端口是？', options: [{ key: 'A', text: '固定 80' }, { key: 'B', text: '读取环境变量 PORT' }, { key: 'C', text: '随机 1234' }, { key: 'D', text: '随意' }], correctAnswer: 'B', explanation: 'Zeabur 通过 PORT 环境变量传递端口。' }] },
  { id: 35, map: 'M4 构建与运行时', difficulty: 'medium', title: '静态站点', description: '静态产物输出目录', type: 'concept', questions: [{ type: 'fill_blank', question: '静态站需设置输出目录，例如 Next.js 默认 ____。', correctAnswers: ['.next', 'out'], explanation: '需指明静态产物目录。' }] },
  { id: 36, map: 'M4 构建与运行时', difficulty: 'hard', title: '多进程', description: '进程模型', type: 'concept', questions: [{ type: 'true_false', statement: '在同一实例内启动多个监听同端口的进程是推荐做法。', correctAnswer: false, explanation: '应单进程监听 PORT，水平扩容用实例数。' }] },
  { id: 37, map: 'M4 构建与运行时', difficulty: 'hard', title: '依赖缓存', description: '提升构建速度', type: 'concept', questions: [{ type: 'single_choice', question: '想加速 Node 构建，可利用？', options: [{ key: 'A', text: 'node_modules 缓存' }, { key: 'B', text: '删除 lockfile' }, { key: 'C', text: '改用 svn' }, { key: 'D', text: '关闭缓存' }], correctAnswer: 'A', explanation: '缓存依赖可减少安装时间。' }] },
  { id: 38, map: 'M4 构建与运行时', difficulty: 'hard', title: '自定义 Dockerfile', description: '高级控制', type: 'concept', questions: [{ type: 'single_choice', question: '若需完全控制运行时，应？', options: [{ key: 'A', text: '使用自定义 Dockerfile' }, { key: 'B', text: '删除 package.json' }, { key: 'C', text: '改为本地运行' }, { key: 'D', text: '关闭 CI/CD' }], correctAnswer: 'A', explanation: 'Dockerfile 让你控制基础镜像与依赖。' }] },
  { id: 39, map: 'M4 构建与运行时', difficulty: 'expert', title: '启动探针', description: '健康检查', type: 'concept', questions: [{ type: 'true_false', statement: '健康检查失败会导致流量不被路由到该实例。', correctAnswer: true, explanation: '探针失败会被摘除。' }] },
  { id: 40, map: 'M4 构建与运行时', difficulty: 'expert', title: '综合测验', description: '构建/运行时要点', type: 'concept', questions: [{ type: 'single_choice', question: '避免端口冲突的最佳做法是？', options: [{ key: 'A', text: '硬编码 3000' }, { key: 'B', text: '读取 PORT 环境变量' }, { key: 'C', text: '监听 0' }, { key: 'D', text: '随机监听' }], correctAnswer: 'B', explanation: '统一监听 PORT。' }] },

  // Map 5 环境与密钥
  { id: 41, map: 'M5 环境与密钥', difficulty: 'easy', title: '环境变量入口', description: '控制台配置', type: 'concept', questions: [{ type: 'fill_blank', question: '敏感信息应放入 ____ 变量。', correctAnswers: ['环境', '环境变量', 'Environment Variables'], explanation: '在 Settings/Env 中配置。' }] },
  { id: 42, map: 'M5 环境与密钥', difficulty: 'easy', title: '密钥管理', description: '避免代码泄露', type: 'concept', questions: [{ type: 'true_false', statement: 'API Key 应写入代码库方便部署。', correctAnswer: false, explanation: '应通过环境变量注入。' }] },
  { id: 43, map: 'M5 环境与密钥', difficulty: 'medium', title: '构建时变量', description: 'Build-time vs Run-time', type: 'concept', questions: [{ type: 'single_choice', question: '前端静态站需要在构建时注入变量，应该放在哪类变量？', options: [{ key: 'A', text: '运行时变量' }, { key: 'B', text: '构建时变量' }, { key: 'C', text: '日志' }, { key: 'D', text: '配置文件明文' }], correctAnswer: 'B', explanation: '静态资源在构建阶段固化变量。' }] },
  { id: 44, map: 'M5 环境与密钥', difficulty: 'medium', title: '多环境配置', description: 'dev/stage/prod', type: 'concept', questions: [{ type: 'true_false', statement: '同一项目可以为不同分支配置不同环境变量。', correctAnswer: true, explanation: '可按环境/分支管理变量。' }] },
  { id: 45, map: 'M5 环境与密钥', difficulty: 'medium', title: 'Secret 轮换', description: '密钥更新', type: 'concept', questions: [{ type: 'single_choice', question: '更新数据库密码后，服务需要？', options: [{ key: 'A', text: '重启/重新部署' }, { key: 'B', text: '无需动作' }, { key: 'C', text: '删除代码' }, { key: 'D', text: '改名仓库' }], correctAnswer: 'A', explanation: '更新变量后需重启生效。' }] },
  { id: 46, map: 'M5 环境与密钥', difficulty: 'hard', title: '变量覆盖', description: '优先级', type: 'concept', questions: [{ type: 'true_false', statement: '同名变量后写的会覆盖先写的。', correctAnswer: true, explanation: '后者覆盖前者。' }] },
  { id: 47, map: 'M5 环境与密钥', difficulty: 'hard', title: '注入方式', description: 'ENV 与文件', type: 'concept', questions: [{ type: 'single_choice', question: '想以文件形式提供凭证，最佳方式是？', options: [{ key: 'A', text: 'Base64 存入变量并解码为文件' }, { key: 'B', text: '明文上传代码库' }, { key: 'C', text: '截图保存' }, { key: 'D', text: '发邮件' }], correctAnswer: 'A', explanation: '可使用变量保存 Base64，在启动时写入文件。' }] },
  { id: 48, map: 'M5 环境与密钥', difficulty: 'hard', title: '配置版本', description: '变更审计', type: 'concept', questions: [{ type: 'true_false', statement: '环境变量变更后无法追踪历史。', correctAnswer: false, explanation: '可在控制台查看变更记录。' }] },
  { id: 49, map: 'M5 环境与密钥', difficulty: 'expert', title: '最佳实践', description: '最小权限原则', type: 'concept', questions: [{ type: 'single_choice', question: '遵循最小权限应如何处理 API Key？', options: [{ key: 'A', text: '复用同一个 key' }, { key: 'B', text: '按环境分开、定期轮换' }, { key: 'C', text: '公开共享' }, { key: 'D', text: '写在 README' }], correctAnswer: 'B', explanation: '分环境、轮换、最小权限。' }] },
  { id: 50, map: 'M5 环境与密钥', difficulty: 'expert', title: '综合测验', description: '变量与密钥总结', type: 'concept', questions: [{ type: 'single_choice', question: '前端构建时需要的变量应该？', options: [{ key: 'A', text: '放在构建时变量' }, { key: 'B', text: '运行时再传' }, { key: 'C', text: '硬编码' }, { key: 'D', text: '用截图' }], correctAnswer: 'A', explanation: '前端静态资源需构建时注入。' }] },

  // Map 6 域名与网络
  { id: 51, map: 'M6 域名与网络', difficulty: 'easy', title: '默认域名', description: '平台分配域名', type: 'concept', questions: [{ type: 'true_false', statement: '每个服务创建后会有一个默认子域名。', correctAnswer: true, explanation: '自动分配二级域名。' }] },
  { id: 52, map: 'M6 域名与网络', difficulty: 'easy', title: '自定义域名', description: '绑定自有域名', type: 'concept', questions: [{ type: 'single_choice', question: '绑定自定义域名需要？', options: [{ key: 'A', text: 'DNS CNAME/A 解析' }, { key: 'B', text: '下载客户端' }, { key: 'C', text: '改代码' }, { key: 'D', text: '关闭 HTTPS' }], correctAnswer: 'A', explanation: '通过 DNS 解析绑定。' }] },
  { id: 53, map: 'M6 域名与网络', difficulty: 'medium', title: 'HTTPS', description: '证书管理', type: 'concept', questions: [{ type: 'true_false', statement: '绑定域名后 Zeabur 会自动签发证书。', correctAnswer: true, explanation: '自动申请/续期证书。' }] },
  { id: 54, map: 'M6 域名与网络', difficulty: 'medium', title: '路径路由', description: '多路径配置', type: 'concept', questions: [{ type: 'single_choice', question: '想将 /api 路由到后端，/ 静态站，应该？', options: [{ key: 'A', text: '使用路由/反向代理配置' }, { key: 'B', text: '复制代码' }, { key: 'C', text: '改域名' }, { key: 'D', text: '不开服务' }], correctAnswer: 'A', explanation: '通过路由规则分流。' }] },
  { id: 55, map: 'M6 域名与网络', difficulty: 'medium', title: '端口暴露', description: '限制外部访问', type: 'concept', questions: [{ type: 'true_false', statement: '内部数据库实例会直接暴露公网端口。', correctAnswer: false, explanation: '默认不暴露数据库公网。' }] },
  { id: 56, map: 'M6 域名与网络', difficulty: 'hard', title: '跨域配置', description: 'CORS 设置', type: 'concept', questions: [{ type: 'single_choice', question: '前端请求跨域 API 报错应？', options: [{ key: 'A', text: '配置 CORS 允许源' }, { key: 'B', text: '关闭 HTTPS' }, { key: 'C', text: '换浏览器' }, { key: 'D', text: '删除代码' }], correctAnswer: 'A', explanation: '在后端开启 CORS。' }] },
  { id: 57, map: 'M6 域名与网络', difficulty: 'hard', title: '重定向', description: 'HTTP 重写', type: 'concept', questions: [{ type: 'true_false', statement: '可以配置 http->https 重定向。', correctAnswer: true, explanation: '支持重定向/重写。' }] },
  { id: 58, map: 'M6 域名与网络', difficulty: 'hard', title: 'WAF/防护', description: '安全防护', type: 'concept', questions: [{ type: 'single_choice', question: '若担心恶意流量，应？', options: [{ key: 'A', text: '开启防护或使用外部 WAF/CDN' }, { key: 'B', text: '关站' }, { key: 'C', text: '把端口改成 81' }, { key: 'D', text: '不处理' }], correctAnswer: 'A', explanation: '可配合 WAF/CDN 防护。' }] },
  { id: 59, map: 'M6 域名与网络', difficulty: 'expert', title: '私网互通', description: '内部服务访问', type: 'concept', questions: [{ type: 'true_false', statement: '同一项目的服务可在私网互相访问。', correctAnswer: true, explanation: '服务间可内网访问。' }] },
  { id: 60, map: 'M6 域名与网络', difficulty: 'expert', title: '综合测验', description: '网络配置检查', type: 'concept', questions: [{ type: 'single_choice', question: '绑定自定义域名正确步骤是？', options: [{ key: 'A', text: '添加 DNS 记录并等待生效' }, { key: 'B', text: '写在 README' }, { key: 'C', text: '改代码' }, { key: 'D', text: '删除默认域名' }], correctAnswer: 'A', explanation: '通过 DNS 解析绑定域名。' }] },

  // Map 7 数据与中间件
  { id: 61, map: 'M7 数据与中间件', difficulty: 'easy', title: '预构建数据库', description: '一键添加数据库', type: 'concept', questions: [{ type: 'single_choice', question: '添加 PostgreSQL 最快捷方式？', options: [{ key: 'A', text: '选择 Prebuilt PostgreSQL' }, { key: 'B', text: '手动编译' }, { key: 'C', text: '本地 SQLite' }, { key: 'D', text: '用 Excel' }], correctAnswer: 'A', explanation: '预构建服务一键可用。' }] },
  { id: 62, map: 'M7 数据与中间件', difficulty: 'easy', title: '连接信息', description: '获取连接串', type: 'concept', questions: [{ type: 'fill_blank', question: '数据库连接串可在服务的 ____ 页面查看。', correctAnswers: ['Overview', '概览'], explanation: '概览/连接信息页面。' }] },
  { id: 63, map: 'M7 数据与中间件', difficulty: 'medium', title: '持久化', description: '数据持久化注意', type: 'concept', questions: [{ type: 'true_false', statement: 'Prebuilt 数据库默认带持久化存储。', correctAnswer: true, explanation: '预构建数据库持久化。' }] },
  { id: 64, map: 'M7 数据与中间件', difficulty: 'medium', title: '版本选择', description: '数据库版本管理', type: 'concept', questions: [{ type: 'single_choice', question: '需要选择 PostgreSQL 版本，应在何处配置？', options: [{ key: 'A', text: '创建数据库时选择版本' }, { key: 'B', text: '改 README' }, { key: 'C', text: '改域名' }, { key: 'D', text: '不支持版本选择' }], correctAnswer: 'A', explanation: '创建时可选版本。' }] },
  { id: 65, map: 'M7 数据与中间件', difficulty: 'medium', title: '外部访问', description: '数据库公网暴露', type: 'concept', questions: [{ type: 'true_false', statement: '数据库默认暴露公网，任何人可连。', correctAnswer: false, explanation: '默认不暴露公网，需手动开启。' }] },
  { id: 66, map: 'M7 数据与中间件', difficulty: 'hard', title: '备份策略', description: '备份/恢复', type: 'concept', questions: [{ type: 'single_choice', question: '想定期备份，应？', options: [{ key: 'A', text: '使用导出或备份策略' }, { key: 'B', text: '关闭数据库' }, { key: 'C', text: '复制代码' }, { key: 'D', text: '改用 txt' }], correctAnswer: 'A', explanation: '应设置备份或导出。' }] },
  { id: 67, map: 'M7 数据与中间件', difficulty: 'hard', title: '连接池', description: '提升并发', type: 'concept', questions: [{ type: 'true_false', statement: '使用连接池可以减少频繁建立连接的开销。', correctAnswer: true, explanation: '连接池提升性能。' }] },
  { id: 68, map: 'M7 数据与中间件', difficulty: 'hard', title: '跨服务访问', description: '私网连库', type: 'concept', questions: [{ type: 'single_choice', question: '应用访问同项目数据库的最佳方式？', options: [{ key: 'A', text: '使用私网地址' }, { key: 'B', text: '暴露公网' }, { key: 'C', text: '写死 127.0.0.1' }, { key: 'D', text: '邮件发送数据' }], correctAnswer: 'A', explanation: '同项目内部走私网。' }] },
  { id: 69, map: 'M7 数据与中间件', difficulty: 'expert', title: '迁移方案', description: '从自建迁移', type: 'concept', questions: [{ type: 'true_false', statement: '迁移时可以先导入数据再切流量。', correctAnswer: true, explanation: '先导入数据，再切流量/域名。' }] },
  { id: 70, map: 'M7 数据与中间件', difficulty: 'expert', title: '综合测验', description: '数据库要点', type: 'concept', questions: [{ type: 'single_choice', question: '减少数据库暴露风险的做法是？', options: [{ key: 'A', text: '使用私网并限制公网访问' }, { key: 'B', text: '共享密码' }, { key: 'C', text: '关闭备份' }, { key: 'D', text: '暴露默认端口' }], correctAnswer: 'A', explanation: '默认不暴露公网，并限制访问。' }] },

  // Map 8 监控与日志
  { id: 71, map: 'M8 监控与日志', difficulty: 'easy', title: '日志查看', description: '控制台日志', type: 'concept', questions: [{ type: 'single_choice', question: '应用日志可以在哪里查看？', options: [{ key: 'A', text: '控制台日志页' }, { key: 'B', text: '只能下载源码' }, { key: 'C', text: '邮件获取' }, { key: 'D', text: '无法查看' }], correctAnswer: 'A', explanation: '控制台可直接看日志。' }] },
  { id: 72, map: 'M8 监控与日志', difficulty: 'easy', title: '指标面板', description: 'CPU/内存监控', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 提供 CPU/内存等指标监控。', correctAnswer: true, explanation: '控制台指标面板可查看。' }] },
  { id: 73, map: 'M8 监控与日志', difficulty: 'medium', title: '日志级别', description: '合适的日志策略', type: 'concept', questions: [{ type: 'single_choice', question: '生产环境推荐的日志级别是？', options: [{ key: 'A', text: 'DEBUG 全开' }, { key: 'B', text: 'INFO/ERROR 分级' }, { key: 'C', text: '关闭日志' }, { key: 'D', text: '全部打印 SQL' }], correctAnswer: 'B', explanation: '按需 INFO/ERROR，避免大量 DEBUG。' }] },
  { id: 74, map: 'M8 监控与日志', difficulty: 'medium', title: '日志保留', description: '日志持久化', type: 'concept', questions: [{ type: 'true_false', statement: '日志会永久保存，不需要额外配置。', correctAnswer: false, explanation: '日志有保留策略，需导出或接入外部。' }] },
  { id: 75, map: 'M8 监控与日志', difficulty: 'medium', title: '异常排查', description: '利用日志定位错误', type: 'concept', questions: [{ type: 'single_choice', question: '遇到 500 错误首先应？', options: [{ key: 'A', text: '查看服务日志' }, { key: 'B', text: '改域名' }, { key: 'C', text: '删除仓库' }, { key: 'D', text: '重装系统' }], correctAnswer: 'A', explanation: '先看日志定位原因。' }] },
  { id: 76, map: 'M8 监控与日志', difficulty: 'hard', title: '外部观测', description: '接入 APM/外部日志', type: 'concept', questions: [{ type: 'true_false', statement: '可以通过环境变量注入 APM SDK 所需配置。', correctAnswer: true, explanation: '可接入外部监控。' }] },
  { id: 77, map: 'M8 监控与日志', difficulty: 'hard', title: '告警', description: '告警设置', type: 'concept', questions: [{ type: 'single_choice', question: '若希望 CPU 超阈值告警，应？', options: [{ key: 'A', text: '配置监控/告警规则' }, { key: 'B', text: '忽略' }, { key: 'C', text: '删除服务' }, { key: 'D', text: '改颜色' }], correctAnswer: 'A', explanation: '需配置告警规则。' }] },
  { id: 78, map: 'M8 监控与日志', difficulty: 'hard', title: '日志出口', description: '导出到外部', type: 'concept', questions: [{ type: 'true_false', statement: '可以将日志导出到外部存储/日志服务。', correctAnswer: true, explanation: '支持外部管道/导出。' }] },
  { id: 79, map: 'M8 监控与日志', difficulty: 'expert', title: '性能分析', description: '利用指标定位瓶颈', type: 'concept', questions: [{ type: 'single_choice', question: 'CPU 飙高但 QPS 低，首先应检查？', options: [{ key: 'A', text: '代码循环/阻塞' }, { key: 'B', text: '域名' }, { key: 'C', text: '换背景' }, { key: 'D', text: '关闭日志' }], correctAnswer: 'A', explanation: '看是否代码逻辑/死循环。' }] },
  { id: 80, map: 'M8 监控与日志', difficulty: 'expert', title: '综合测验', description: '监控与日志总结', type: 'concept', questions: [{ type: 'single_choice', question: '高效排障的首要步骤是？', options: [{ key: 'A', text: '查看日志/指标' }, { key: 'B', text: '先重装' }, { key: 'C', text: '改端口' }, { key: 'D', text: '关机' }], correctAnswer: 'A', explanation: '先看日志和指标。' }] },

  // Map 9 安全与权限
  { id: 81, map: 'M9 安全与权限', difficulty: 'easy', title: 'HTTPS 默认', description: '传输安全', type: 'concept', questions: [{ type: 'true_false', statement: 'Zeabur 自定义域名支持自动 HTTPS。', correctAnswer: true, explanation: '自动申请证书。' }] },
  { id: 82, map: 'M9 安全与权限', difficulty: 'easy', title: '环境变量保护', description: '敏感信息隔离', type: 'concept', questions: [{ type: 'single_choice', question: '保护密钥最关键的是？', options: [{ key: 'A', text: '不要写入代码仓库' }, { key: 'B', text: '打印到日志' }, { key: 'C', text: '发朋友圈' }, { key: 'D', text: '硬编码' }], correctAnswer: 'A', explanation: '用环境变量存储密钥。' }] },
  { id: 83, map: 'M9 安全与权限', difficulty: 'medium', title: '数据库访问控制', description: '限制来源', type: 'concept', questions: [{ type: 'true_false', statement: '数据库应限制公网访问，优先走私网。', correctAnswer: true, explanation: '默认不暴露公网，建议私网访问。' }] },
  { id: 84, map: 'M9 安全与权限', difficulty: 'medium', title: '最小权限', description: '凭证与账号', type: 'concept', questions: [{ type: 'single_choice', question: '下列哪项符合最小权限？', options: [{ key: 'A', text: '按角色分配权限' }, { key: 'B', text: '所有人用同一 root' }, { key: 'C', text: '公开凭证' }, { key: 'D', text: '日志打印 token' }], correctAnswer: 'A', explanation: '按角色/环境分权限。' }] },
  { id: 85, map: 'M9 安全与权限', difficulty: 'medium', title: '密钥轮换', description: '定期更新', type: 'concept', questions: [{ type: 'true_false', statement: '生产密钥长期不换是安全做法。', correctAnswer: false, explanation: '应定期轮换。' }] },
  { id: 86, map: 'M9 安全与权限', difficulty: 'hard', title: '审计日志', description: '变更追踪', type: 'concept', questions: [{ type: 'single_choice', question: '想追踪谁改了环境变量，应查看？', options: [{ key: 'A', text: '审计/变更记录' }, { key: 'B', text: 'README' }, { key: 'C', text: '本地日志' }, { key: 'D', text: '无记录' }], correctAnswer: 'A', explanation: '控制台提供变更记录。' }] },
  { id: 87, map: 'M9 安全与权限', difficulty: 'hard', title: '依赖安全', description: '供应链风险', type: 'concept', questions: [{ type: 'true_false', statement: '应定期更新依赖并检查漏洞。', correctAnswer: true, explanation: '供应链安全需关注依赖漏洞。' }] },
  { id: 88, map: 'M9 安全与权限', difficulty: 'hard', title: '网络防护', description: '防护策略', type: 'concept', questions: [{ type: 'single_choice', question: '抵御恶意流量可以？', options: [{ key: 'A', text: '接入 WAF/CDN' }, { key: 'B', text: '关闭服务' }, { key: 'C', text: '日志输出密钥' }, { key: 'D', text: '无视' }], correctAnswer: 'A', explanation: '可接入 WAF/CDN。' }] },
  { id: 89, map: 'M9 安全与权限', difficulty: 'expert', title: '合规', description: '合规要求', type: 'concept', questions: [{ type: 'true_false', statement: '处理用户数据需关注合规和数据存储位置。', correctAnswer: true, explanation: '需遵守合规要求。' }] },
  { id: 90, map: 'M9 安全与权限', difficulty: 'expert', title: '综合测验', description: '安全要点', type: 'concept', questions: [{ type: 'single_choice', question: '保护数据库的正确组合？', options: [{ key: 'A', text: '私网访问+最小权限+定期轮换' }, { key: 'B', text: '公开密码' }, { key: 'C', text: '硬编码密钥' }, { key: 'D', text: '关闭日志' }], correctAnswer: 'A', explanation: '最小权限、私网访问、轮换密钥。' }] },

  // Map 10 运营与排障
  { id: 91, map: 'M10 运营与排障', difficulty: 'easy', title: '发布管理', description: '版本发布', type: 'concept', questions: [{ type: 'true_false', statement: '每次部署可视为一次发布，控制台可查看历史。', correctAnswer: true, explanation: '发布历史可回溯。' }] },
  { id: 92, map: 'M10 运营与排障', difficulty: 'easy', title: '回滚', description: '快速回滚', type: 'concept', questions: [{ type: 'single_choice', question: '发现线上问题，最快回到上个版本的方法？', options: [{ key: 'A', text: '使用回滚/重部署上一个版本' }, { key: 'B', text: '删库' }, { key: 'C', text: '改端口' }, { key: 'D', text: '重装系统' }], correctAnswer: 'A', explanation: '可回滚到上一个成功版本。' }] },
  { id: 93, map: 'M10 运营与排障', difficulty: 'medium', title: '冷启动', description: '休眠唤醒', type: 'concept', questions: [{ type: 'true_false', statement: '服务休眠后首次访问可能有冷启动。', correctAnswer: true, explanation: '休眠节省成本但有冷启动。' }] },
  { id: 94, map: 'M10 运营与排障', difficulty: 'medium', title: '健康检查失败', description: '排查指引', type: 'concept', questions: [{ type: 'single_choice', question: '健康检查失败首先应？', options: [{ key: 'A', text: '查看日志和探针路径' }, { key: 'B', text: '换主题' }, { key: 'C', text: '改域名' }, { key: 'D', text: '重启电脑' }], correctAnswer: 'A', explanation: '先检查探针配置与日志。' }] },
  { id: 95, map: 'M10 运营与排障', difficulty: 'medium', title: '构建失败', description: 'CI 失败排查', type: 'concept', questions: [{ type: 'true_false', statement: '构建失败可在日志中查看具体错误并重试。', correctAnswer: true, explanation: '查看构建日志定位原因。' }] },
  { id: 96, map: 'M10 运营与排障', difficulty: 'hard', title: '流量突增', description: '扩容策略', type: 'concept', questions: [{ type: 'single_choice', question: '应对流量突增，首选？', options: [{ key: 'A', text: '增加实例/规格' }, { key: 'B', text: '关站' }, { key: 'C', text: '删代码' }, { key: 'D', text: '重启本地' }], correctAnswer: 'A', explanation: '可水平/垂直扩容。' }] },
  { id: 97, map: 'M10 运营与排障', difficulty: 'hard', title: '延迟升高', description: '性能排查', type: 'concept', questions: [{ type: 'true_false', statement: '延迟升高应检查日志、指标以及依赖服务状态。', correctAnswer: true, explanation: '综合排查依赖/DB/网络。' }] },
  { id: 98, map: 'M10 运营与排障', difficulty: 'hard', title: '依赖故障', description: '外部依赖不可用', type: 'concept', questions: [{ type: 'single_choice', question: '第三方 API 故障，最佳处理？', options: [{ key: 'A', text: '增加重试/降级' }, { key: 'B', text: '删除项目' }, { key: 'C', text: '重启电脑' }, { key: 'D', text: '无视' }], correctAnswer: 'A', explanation: '增加重试和降级策略。' }] },
  { id: 99, map: 'M10 运营与排障', difficulty: 'expert', title: '灰度发布', description: '渐进式发布', type: 'concept', questions: [{ type: 'true_false', statement: '可以通过多实例配合路由实现灰度。', correctAnswer: true, explanation: '多实例+路由可灰度发布。' }] },
  { id: 100, map: 'M10 运营与排障', difficulty: 'expert', title: '综合测验', description: '运维总结', type: 'concept', questions: [{ type: 'single_choice', question: '发现线上问题后正确顺序是？', options: [{ key: 'A', text: '看日志→回滚/修复→验证' }, { key: 'B', text: '删库' }, { key: 'C', text: '改域名' }, { key: 'D', text: '放弃' }], correctAnswer: 'A', explanation: '先日志排查，必要时回滚或修复。' }] },
];

export const ZEABUR_COURSE: Course = {
  id: 'zeabur-training',
  name: 'Zeabur 云平台速成',
  icon: '☁️',
  description: '10 分钟掌握 Zeabur 核心概念',
  type: 'concept',
  levels: ZEABUR_LEVELS as ConceptLevel[]
};

export const PYTHON_CODE_COURSE: Course = {
  id: 'python-kids',
  name: 'Python 少儿编程',
  icon: '🐍',
  description: '写代码闯关，逐关升级',
  type: 'code',
  levels: []
};

// 所有可用课程
export const ALL_COURSES: Course[] = [PYTHON_CODE_COURSE, ZEABUR_COURSE];

// 根据 ID 获取课程
export const getCourseById = (id: string): Course | undefined => {
  return ALL_COURSES.find(c => c.id === id);
};
