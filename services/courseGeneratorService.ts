import { GoogleGenerativeAI } from "@google/generative-ai";
import { Course, ConceptLevel } from '../types';
import { CrawledPage } from './crawlerService';

export interface CourseGenerationConfig {
  mapCount: number;
  levelsPerMap: number;
  difficultyMode: 'uniform' | 'progressive' | 'random';
  questionMode: 'sequential' | 'random' | 'adaptive';
  questionTypes: Array<'single_choice' | 'true_false' | 'fill_blank'>;
}

export const DEFAULT_CONFIG: CourseGenerationConfig = {
  mapCount: 3,
  levelsPerMap: 10,
  difficultyMode: 'progressive',
  questionMode: 'sequential',
  questionTypes: ['single_choice', 'true_false', 'fill_blank'],
};

// 单次 LLM 调用最多生成多少关卡，超出则分批多次生成后合并
const LEVELS_PER_CALL = 10;

const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && (process as any).env?.API_KEY) ||
  (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) ||
  '';

const apiUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_URL) ||
  'https://hnd1.aihub.zeabur.ai/gemini';

class CourseGeneratorService {
  private buildPrompt(content: string, config: CourseGenerationConfig, mapIndex: number, levelsToGenerate: number, startIndex: number): string {
    const difficultyDesc: Record<CourseGenerationConfig['difficultyMode'], string> = {
      uniform: '所有题目难度均匀分布',
      progressive: '难度从易到难递增',
      random: '难度随机分布',
    };

    return `
你是一位专业的教育内容设计师。请严格、仅根据下方提供的材料生成学习关卡，禁止输出与材料无关的通用题（例如 Python 入门、随机常识等）。

【输入材料】
${content.slice(0, 8000)}

【生成要求】
1. 生成本批次 ${levelsToGenerate} 个关卡（本地图总关卡从第 ${startIndex + 1} 关开始累加）
2. 这是第 ${mapIndex + 1} 张地图
3. 难度分布: ${difficultyDesc[config.difficultyMode]}
4. 题型分布: ${config.questionTypes.join('、')}
5. 每个关卡 1 道核心题目

【输出格式 (严格 JSON)】
{
  "mapTitle": "地图名称",
  "mapDescription": "地图描述",
  "levels": [
    {
      "id": 1,
      "title": "关卡标题",
      "difficulty": "easy|medium|hard",
      "question": {
        "type": "single_choice",
        "question": "问题文本",
        "options": [
          {"key": "A", "text": "选项A"},
          {"key": "B", "text": "选项B"},
          {"key": "C", "text": "选项C"},
          {"key": "D", "text": "选项D"}
        ],
        "correctAnswer": "B",
        "explanation": "解释说明"
      }
    }
  ]
}

约束:
- 所有地图名称、关卡标题、题干、选项、解析必须从输入材料提炼，不得凭空杜撰，也不得生成“Python 入门”这类无关内容。
- 如果材料中信息不足以支撑关卡，请在 mapTitle 中给出“输入信息不足，无法生成”，并输出空 levels。
- type 为 true_false 时，使用 statement + correctAnswer (boolean)
- type 为 fill_blank 时，使用 question (含____) + correctAnswers (数组)
`;
  }

  private async generateMap(content: string, config: CourseGenerationConfig, mapIndex: number, levelsToGenerate: number, startIndex: number) {
    const prompt = this.buildPrompt(content, config, mapIndex, levelsToGenerate, startIndex);
    if (!apiKey) throw new Error('缺少 GEMINI_API_KEY，无法生成课程');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // @ts-ignore
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { baseUrl: apiUrl });
      const result = await model.generateContent(
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } },
        { signal: controller.signal }
      );
      const rawText = result.response.text() || '{}';
      const clean = String(rawText).replace(/```json\\n?|```/g, '').replace(/^json\s*/i, '').trim();
      try {
        return JSON.parse(clean);
      } catch (parseErr) {
        throw new Error(`LLM 返回非 JSON 或格式错误，响应片段: ${clean.slice(0, 200)}`);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('LLM 生成超时（30s），请稍后重试或减少地图数量。');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateCourse(
    content: string,
    courseName: string,
    config: CourseGenerationConfig,
    onProgress?: (current: number, total: number) => void,
    pages?: CrawledPage[]
  ): Promise<Course> {
    if (!apiKey) {
      throw new Error('缺少 GEMINI_API_KEY，无法调用 LLM 生成课程');
    }
    // 若提供页面列表，则按页面顺序合并为不同地图的上下文
    const sourceChunks: { text: string; title?: string }[] = [];
    if (pages && pages.length > 0) {
      const maps = Math.max(1, config.mapCount);
      const perMap = Math.max(1, Math.ceil(pages.length / maps));
      for (let i = 0; i < maps; i++) {
        const slice = pages.slice(i * perMap, (i + 1) * perMap);
        if (slice.length > 0) {
          sourceChunks.push({
            text: slice.map((p) => p.markdown).join('\n\n'),
            title: slice[0].title,
          });
        }
      }
    } else {
      const chunkSize = Math.ceil(content.length / config.mapCount);
      for (let i = 0; i < config.mapCount; i++) {
        sourceChunks.push({ text: content.slice(i * chunkSize, (i + 1) * chunkSize) });
      }
    }

    const maps: { title: string; description: string; levels: ConceptLevel[] }[] = [];
    const perMapBatches = Math.max(1, Math.ceil(config.levelsPerMap / LEVELS_PER_CALL));
    const totalBatches = sourceChunks.length * perMapBatches;
    let progressDone = 0;

    for (let i = 0; i < sourceChunks.length; i++) {
      const chunk = sourceChunks[i].text;
      const baseId = i * config.levelsPerMap;
      const mergedLevels: ConceptLevel[] = [];
      let usedTitle = '';
      for (let batch = 0; batch < perMapBatches; batch++) {
        const startIndex = batch * LEVELS_PER_CALL;
        const need = Math.min(LEVELS_PER_CALL, config.levelsPerMap - startIndex);
        if (need <= 0) break;
        const mapData = await this.generateMap(chunk, { ...config, levelsPerMap: need }, i, need, startIndex);
        const normalized: ConceptLevel[] = (mapData.levels || []).map((lvl: any, idx: number) => ({
          id: baseId + startIndex + idx + 1,
          title: lvl.title || `关卡 ${startIndex + idx + 1}`,
          description: lvl.description || lvl.title || '',
          type: 'concept',
          difficulty: lvl.difficulty || 'easy',
          map: mapData.mapTitle || sourceChunks[i].title || `地图 ${i + 1}`,
          questions: lvl.question ? [lvl.question] : [],
        }));
        mergedLevels.push(...normalized);
        usedTitle = usedTitle || mapData.mapTitle;
        progressDone += 1;
        onProgress?.(progressDone, totalBatches);
        await new Promise((r) => setTimeout(r, 400));
      }

      if (!mergedLevels.length) {
        throw new Error(`地图 ${i + 1} 未生成任何关卡，请检查输入或模型输出。`);
      }
      maps.push({
        title: usedTitle || sourceChunks[i].title || `地图 ${i + 1}`,
        description: '',
        levels: mergedLevels,
      });
    }

    const allLevels = maps.flatMap((m) => m.levels);
    if (allLevels.length === 0) {
      throw new Error('LLM 生成结果为空，请检查输入内容或 API Key 权限。');
    }

    return {
      id: `custom-${Date.now()}`,
      name: courseName || '自定义课程',
      icon: '📚',
      description: `自定义课程 - ${config.mapCount} 张地图，${allLevels.length} 个关卡`,
      type: 'concept',
      maps: maps.map((m, idx) => ({
        id: idx,
        title: m.title,
        description: m.description,
        levelCount: m.levels.length,
      })),
      levels: allLevels,
      config,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
  }
}

export const courseGeneratorService = new CourseGeneratorService();
