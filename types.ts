
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export type Language = 'en' | 'zh';

export type CoachPersona = 'gentle' | 'sarcastic' | 'professional' | 'concise' | 'stepbystep' | 'mentor';

export interface ChatMessage {
  role: MessageRole;
  text: string;
  isError?: boolean;
}

export interface LevelVariant {
  task: string;
  starterCode: string;
  hint: string;
  description?: string; // Optional override description
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  task: string;
  starterCode: string;
  concepts: string[];
  hint: string;
  timeLimit: number;
  variants?: LevelVariant[]; // New: Array of alternative questions
}

// Updated UserState
export interface UserState {
  id: string; // Unique ID
  name: string;
  currentLevel: number;
  stars: number;
  levelStars: Record<number, number>;
  xp: number;
  unlockedBadges: string[];
  language: Language;
  hasSeenTutorial: boolean;
  settings: {
    voiceURI: string | null;
    persona: CoachPersona;
  };
  currentBank: 'A' | 'B' | 'C'; // Question Bank
}

export interface AIContext {
  currentLevel: number;
  levelTitle?: string;
  levelTask?: string;
  currentCode: string;
  userXp: number;
  extra?: string;
}

export interface ValidationResult {
  success: boolean;
  output: string;
  feedback: string;
  starsEarned?: number;
}

// ---------- 概念题类型 ----------

/** 单选题 */
export interface SingleChoiceQuestion {
  type: 'single_choice';
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

/** 判断题 */
export interface TrueFalseQuestion {
  type: 'true_false';
  statement: string;
  correctAnswer: boolean;
  explanation: string;
}

/** 填空题 */
export interface FillBlankQuestion {
  type: 'fill_blank';
  question: string;
  correctAnswers: string[];
  caseSensitive?: boolean;
  explanation: string;
}

/** 概念题联合类型 */
export type ConceptQuestion =
  | SingleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion;

// ---------- 课程结构 ----------

/** 概念关卡 */
export interface ConceptLevel {
  id: number;
  title: string;
  description: string;
  type: 'concept';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  map?: string; // 分组/地图名
  questions: ConceptQuestion[];
}

/** 课程定义 */
export interface Course {
  id: string;
  name: string;
  icon: string;
  description?: string;
  type: 'code' | 'concept';
  levels: ConceptLevel[] | LevelData[];
}
