import React from 'react';
import type { CourseConfig, LevelConfig as ConfigLevelConfig } from '../types/config';
import { Course, ConceptLevel, ConceptQuestion } from '../types';

// Static JSON configs
import defaultGameConfig from '../config/game.config.json';
import zeaburCourseConfig from '../config/courses/zeabur.course.json';
import pythonCourseConfig from '../config/courses/python.course.json';

export interface GameConfig {
  scoring: {
    baseScore: number;
    timeBonusMultiplier: number;
    starRules: { firstAttempt: number; secondAttempt: number; thirdOrMore: number };
    xpRewards: Record<string, number>;
  };
  difficulty: Record<
    string,
    {
      timeLimit: number;
      hintsAllowed: number;
      penaltyPerWrong: number;
      showExplanation: boolean;
    }
  >;
  progression: {
    unlockMode: 'sequential' | 'free' | 'stars';
    requireStarsToUnlock: number;
    allowReplay: boolean;
    autoAdvance: boolean;
    autoAdvanceDelay: number;
  };
  coach: {
    defaultPersona: string;
    defaultVoice: string;
    autoReadQuestion: boolean;
    showHintAfterWrong: number;
  };
  review: {
    showAfterLevel: boolean;
    showAfterMap: boolean;
    aiSummaryEnabled: boolean;
  };
}

const DEFAULT_OVERRIDES_KEY = 'lalalearn_config_overrides';
const DEFAULT_CUSTOM_COURSES_KEY = 'zlearn_custom_courses';

class ConfigService {
  private gameConfig: GameConfig;
  private courses: Map<string, CourseConfig> = new Map();
  private overrides: Record<string, any> = {};
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  constructor() {
    this.gameConfig = defaultGameConfig as GameConfig;
    this.registerCourseConfig(zeaburCourseConfig as CourseConfig);
    this.registerCourseConfig(pythonCourseConfig as CourseConfig);
    this.loadOverrides();
    this.loadCustomCourses();
  }

  // ========== Config Accessors ==========

  get<T = any>(path: string): T {
    if (path in this.overrides) return this.overrides[path] as T;
    const keys = path.split('.');
    let value: any = this.gameConfig;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined as T;
      }
    }
    return value as T;
  }

  override(path: string, value: any): void {
    this.overrides[path] = value;
    this.saveOverrides();
    this.notifyListeners(path, value);
  }

  reset(path?: string): void {
    if (path) delete this.overrides[path];
    else this.overrides = {};
    this.saveOverrides();
  }

  watch(path: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(path)) this.listeners.set(path, new Set());
    this.listeners.get(path)!.add(callback);
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  }

  // ========== Course Accessors ==========

  registerCourseConfig(course: CourseConfig): void {
    this.courses.set(course.id, course);
  }

  getCourseConfig(courseId: string): CourseConfig | undefined {
    return this.courses.get(courseId);
  }

  getAllCourseConfigs(): CourseConfig[] {
    return Array.from(this.courses.values());
  }

  getLevelConfig(courseId: string, levelId: number): ConfigLevelConfig {
    const course = this.courses.get(courseId);
    const level = course?.levels.find((l) => l.id === levelId);
    const difficulty = level?.difficulty || 'easy';
    const globalDefaults = this.get<GameConfig['difficulty'][string]>(`difficulty.${difficulty}`) || {};
    const levelConfig = level?.config || {};
    return {
      timeLimit: levelConfig.timeLimit ?? globalDefaults.timeLimit ?? 0,
      maxAttempts: levelConfig.maxAttempts ?? 0,
      showHints: levelConfig.showHints ?? true,
      hintCost: levelConfig.hintCost ?? 0,
      xpBase: levelConfig.xpBase ?? 100,
      xpBonus: levelConfig.xpBonus ?? {
        noHint: 20,
        fastComplete: 30,
        firstTry: 50,
      },
    };
  }

  getCourses(): Course[] {
    return this.getAllCourseConfigs().map((config) => this.toCourse(config));
  }

  saveCustomCourse(course: CourseConfig): void {
    course.isCustom = true;
    this.registerCourseConfig(course);
    const all = this.getCustomCoursesFromStorage();
    const filtered = all.filter((c) => c.id !== course.id);
    filtered.push(course);
    localStorage.setItem(DEFAULT_CUSTOM_COURSES_KEY, JSON.stringify(filtered));
  }

  deleteCustomCourse(courseId: string): void {
    this.courses.delete(courseId);
    const remaining = this.getCustomCoursesFromStorage().filter((c) => c.id !== courseId);
    localStorage.setItem(DEFAULT_CUSTOM_COURSES_KEY, JSON.stringify(remaining));
  }

  // ========== Helpers ==========

  private toCourse(config: CourseConfig): Course {
    const settingsType = (config.settings as any)?.type || 'concept';
    const levelList = config.levels || [];
    const mapsList = config.maps || [];

    const normalizeQuestion = (question: any): ConceptQuestion | null => {
      if (!question) return null;
      return question as ConceptQuestion;
    };

    const levels: ConceptLevel[] =
      settingsType === 'concept'
        ? levelList.map((lvl, idx) => ({
            id: lvl.id,
            title: lvl.title || `关卡 ${lvl.id || idx + 1}`,
            description: lvl.description,
            type: 'concept',
            difficulty: lvl.difficulty,
            map:
              lvl.map ||
              mapsList.find((m) => m.id === lvl.mapIndex)?.title ||
              mapsList[lvl.mapIndex || 0]?.title ||
              `地图 ${typeof lvl.mapIndex === 'number' ? lvl.mapIndex + 1 : 1}`,
            questions: normalizeQuestion(lvl.question) ? [normalizeQuestion(lvl.question)!] : [],
          }))
        : [];

    const course: Course = {
      id: config.id,
      name: config.metadata.name,
      icon: config.metadata.icon,
      description: config.metadata.description,
      type: settingsType as any,
      levels: settingsType === 'concept' ? levels : [],
      maps: mapsList.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        levelCount: levelList.filter((lvl) => lvl.mapIndex === m.id).length,
        unlockCondition: m.unlockCondition,
        bonusXP: m.bonusXP,
      })),
      config: config.config,
      createdAt: config.createdAt,
      isCustom: config.isCustom,
    };

    return course;
  }

  private loadOverrides(): void {
    try {
      const saved = localStorage.getItem(DEFAULT_OVERRIDES_KEY);
      if (saved) this.overrides = JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to load config overrides', err);
    }
  }

  private saveOverrides(): void {
    localStorage.setItem(DEFAULT_OVERRIDES_KEY, JSON.stringify(this.overrides));
  }

  private notifyListeners(path: string, value: any): void {
    this.listeners.get(path)?.forEach((cb) => cb(value));
  }

  private loadCustomCourses(): void {
    try {
      const saved = localStorage.getItem(DEFAULT_CUSTOM_COURSES_KEY);
      if (!saved) return;
      const list = JSON.parse(saved) as CourseConfig[];
      list.forEach((c) => {
        const normalizedLevels = (c.levels || []).map((lvl: any) => ({
          ...lvl,
          question: lvl.question || (lvl.questions ? lvl.questions[0] : null) || null,
        }));
        this.registerCourseConfig({ ...c, levels: normalizedLevels as any, isCustom: true });
      });
    } catch (err) {
      console.warn('Failed to load custom courses', err);
    }
  }

  private getCustomCoursesFromStorage(): CourseConfig[] {
    try {
      const saved = localStorage.getItem(DEFAULT_CUSTOM_COURSES_KEY);
      if (!saved) return [];
      return JSON.parse(saved) as CourseConfig[];
    } catch {
      return [];
    }
  }
}

export const configService = new ConfigService();

export function useConfig<T = any>(path: string): T {
  const [value, setValue] = React.useState<T>(() => configService.get<T>(path));
  React.useEffect(() => configService.watch(path, setValue), [path]);
  return value;
}
