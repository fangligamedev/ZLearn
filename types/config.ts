import { ConceptQuestion } from '../types';

export interface LevelConfig {
  timeLimit?: number;
  maxAttempts?: number;
  showHints?: boolean;
  hintCost?: number;
  xpBase?: number;
  xpBonus?: {
    noHint?: number;
    fastComplete?: number;
    firstTry?: number;
  };
}

export interface CoachingConfig {
  introMessage?: string;
  successMessage?: string;
  failMessage?: string;
  contextTags?: string[];
}

export interface LevelDefinition {
  id: number;
  mapIndex?: number;
  map?: string;
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  config?: LevelConfig;
  question: ConceptQuestion | null;
  coaching?: CoachingConfig;
}

export interface CourseMetadata {
  name: string;
  icon: string;
  description: string;
  author?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  targetAudience?: string[];
}

export interface CourseSettings {
  type: 'code' | 'concept';
  questionModes?: Array<'single_choice' | 'true_false' | 'fill_blank'>;
  difficultyProgression?: 'uniform' | 'progressive' | 'random';
  shuffleQuestions?: boolean;
  allowSkip?: boolean;
}

export interface MapDefinition {
  id: number;
  title: string;
  description?: string;
  unlockCondition?: { mapId: number; minStars: number } | null;
  bonusXP?: number;
}

export interface CourseConfig {
  id: string;
  version: string;
  metadata: CourseMetadata;
  settings: CourseSettings;
  maps: MapDefinition[];
  levels: LevelDefinition[];
  config?: Record<string, unknown>;
  createdAt?: string;
  isCustom?: boolean;
}
