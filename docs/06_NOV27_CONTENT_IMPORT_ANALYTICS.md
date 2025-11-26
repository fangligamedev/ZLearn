# ZLearn 11月27日开发计划
## 内容导入 + 数据分析系统

> **日期**: 2025-11-27  
> **预估时间**: 6-8 小时  
> **核心目标**: 用户自定义课程生成 + 学习数据持久化分析

---

## 📋 当前进度总结

### ✅ 已完成功能 (MVP Demo)
- Zeabur 课程: 10 张地图、100 关卡，按地图/难度筛选
- 概念题型: 单选/判断/填空，按尝试次数降星评分
- 聊天教练: 专业严谨型 + 美嘉音色，自动注入题目上下文
- 复盘面板: 完成关卡/星数/正确率/错题列表/昨日学习时长
- TTS/填空显示修复，构建预览可用

### 🎯 今日开发目标
1. **内容导入与课程生成** - 用户可导入 PDF/MD/网页生成自定义课程
2. **游戏化配置系统** - 关卡/课程参数通过 JSON 配置文件暴露，可灵活调整
3. **数据持久化与分析** - 游戏化埋点 + 留存分析 + Zeabur 数据备份

---

## 🚀 开发计划

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOV 27 DEVELOPMENT PLAN                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE A: 内容导入与课程生成                        Est: 3-4 hours  │
│  ─────────────────────────────────────                             │
│  Step A.1: 导入服务核心 (PDF/MD/URL)                                │
│  Step A.2: AI 课程生成服务                                          │
│  Step A.3: 课程创建向导 UI                                          │
│  Step A.4: 动态课程管理                                             │
│                                                                     │
│  PHASE C: 游戏化配置系统                            Est: 2-3 hours  │
│  ─────────────────────────────────────                             │
│  Step C.1: 课程/关卡配置文件设计                                    │
│  Step C.2: 配置服务 (configService)                                 │
│  Step C.3: 配置热加载与运行时覆盖                                   │
│  Step C.4: 配置编辑器 UI (可选)                                     │
│                                                                     │
│  PHASE B: 数据持久化与分析                          Est: 3-4 hours  │
│  ─────────────────────────────────────                             │
│  Step B.1: IndexedDB 存储服务                                       │
│  Step B.2: 埋点事件收集                                             │
│  Step B.3: 留存/学习分析引擎                                         │
│  Step B.4: Zeabur 数据备份方案                                      │
│                                                                     │
│                                          Total Est: 8-11 hours     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# PHASE A: 内容导入与课程生成

## A.1 架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CONTENT IMPORT FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   用户输入                                                           │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📄 PDF上传  |  📝 Markdown粘贴  |  🌐 网页URL              │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📊 课程配置面板                                             │  │
│   │  • 地图数量: [1-10]  滑块                                    │  │
│   │  • 每地图关卡: [5-20] 滑块                                   │  │
│   │  • 难度分布: [均匀/递增/随机]                                 │  │
│   │  • 做题模式: [顺序/随机/自适应]                               │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  🤖 AI 课程生成                                              │  │
│   │  1. 内容解析 → 知识点提取                                     │  │
│   │  2. 难度评估 → 关卡分配                                       │  │
│   │  3. 题目生成 → 多题型分布                                     │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📚 自定义课程 (与 Python/Zeabur 平行)                       │  │
│   │  • 显示在课程切换 Tab                                        │  │
│   │  • 独立进度追踪                                               │  │
│   │  • 可编辑/删除                                                │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step A.1: 导入服务核心

### 📥 Input
- PDF 文件 (通过 FileReader)
- Markdown 文本
- 网页 URL (通过 Jina Reader API)

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/importService.ts
// ============================================================

export interface ImportSource {
  type: 'pdf' | 'markdown' | 'url';
  content: string | File;
  name?: string;
}

export interface ImportResult {
  success: boolean;
  text: string;
  metadata: {
    title: string;
    wordCount: number;
    estimatedTokens: number;
  };
  error?: string;
}

class ImportService {
  /**
   * PDF 解析 (使用 pdf.js)
   */
  async parsePDF(file: File): Promise<ImportResult> {
    // 使用 pdfjs-dist 库提取文本
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return {
      success: true,
      text: fullText,
      metadata: {
        title: file.name.replace('.pdf', ''),
        wordCount: fullText.split(/\s+/).length,
        estimatedTokens: Math.round(fullText.length / 4)
      }
    };
  }

  /**
   * Markdown 解析
   */
  parseMarkdown(content: string, name?: string): ImportResult {
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : name || '未命名文档';
    
    // 移除 Markdown 语法，保留纯文本
    const plainText = content
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`[^`]+`/g, '')        // 移除行内代码
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接 → 文本
      .replace(/[#*_~>`]/g, '')       // 移除标记符号
      .trim();
    
    return {
      success: true,
      text: plainText,
      metadata: {
        title,
        wordCount: plainText.split(/\s+/).length,
        estimatedTokens: Math.round(plainText.length / 4)
      }
    };
  }

  /**
   * 网页抓取 (Jina Reader API)
   */
  async fetchURL(url: string): Promise<ImportResult> {
    try {
      const readerUrl = `https://r.jina.ai/${url}`;
      const response = await fetch(readerUrl, {
        headers: { 'Accept': 'text/markdown' }
      });
      
      if (!response.ok) {
        throw new Error(`抓取失败: ${response.status}`);
      }
      
      const markdown = await response.text();
      return this.parseMarkdown(markdown, new URL(url).hostname);
    } catch (error) {
      return {
        success: false,
        text: '',
        metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
        error: error instanceof Error ? error.message : '网页抓取失败'
      };
    }
  }

  /**
   * 统一导入入口
   */
  async import(source: ImportSource): Promise<ImportResult> {
    switch (source.type) {
      case 'pdf':
        return this.parsePDF(source.content as File);
      case 'markdown':
        return this.parseMarkdown(source.content as string, source.name);
      case 'url':
        return this.fetchURL(source.content as string);
      default:
        return {
          success: false,
          text: '',
          metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
          error: '不支持的导入类型'
        };
    }
  }
}

export const importService = new ImportService();
```

### 📤 Output
- `src/services/importService.ts`

### ✅ 验收标准
- PDF 文件可成功解析为文本
- Markdown 内容可正确提取
- URL 通过 Jina Reader 获取内容

---

## Step A.2: AI 课程生成服务

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/courseGeneratorService.ts
// ============================================================

import { Course, ConceptLevel, ConceptQuestion } from '../types';

/** 课程生成配置 */
export interface CourseGenerationConfig {
  mapCount: number;          // 地图数量 (1-10)
  levelsPerMap: number;      // 每地图关卡数 (5-20)
  difficultyMode: 'uniform' | 'progressive' | 'random';  // 难度分布
  questionMode: 'sequential' | 'random' | 'adaptive';    // 做题模式
  questionTypes: ('single_choice' | 'true_false' | 'fill_blank')[]; // 题型
}

/** 默认配置 */
export const DEFAULT_CONFIG: CourseGenerationConfig = {
  mapCount: 3,
  levelsPerMap: 10,
  difficultyMode: 'progressive',
  questionMode: 'sequential',
  questionTypes: ['single_choice', 'true_false', 'fill_blank']
};

class CourseGeneratorService {
  /**
   * 生成课程 Prompt
   */
  private buildPrompt(
    content: string,
    config: CourseGenerationConfig,
    mapIndex: number
  ): string {
    const totalLevels = config.levelsPerMap;
    const difficultyDesc = {
      uniform: '所有题目难度均匀分布',
      progressive: '难度从易到难递增',
      random: '难度随机分布'
    }[config.difficultyMode];

    return `
你是一位专业的教育内容设计师。请根据以下材料生成学习关卡。

【输入材料】
${content.slice(0, 8000)} // 限制 Token

【生成要求】
1. 生成 ${totalLevels} 个关卡
2. 这是第 ${mapIndex + 1} 张地图
3. 难度分布: ${difficultyDesc}
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

注意:
- type 为 true_false 时，使用 statement + correctAnswer (boolean)
- type 为 fill_blank 时，使用 question (含____) + correctAnswers (数组)
`;
  }

  /**
   * 调用 AI 生成单张地图
   */
  async generateMap(
    content: string,
    config: CourseGenerationConfig,
    mapIndex: number
  ): Promise<{
    mapTitle: string;
    mapDescription: string;
    levels: ConceptLevel[];
  }> {
    const prompt = this.buildPrompt(content, config, mapIndex);
    
    // 调用 Gemini API
    const response = await fetch('https://hnd1.aihub.zeabur.ai/gemini/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // 清理并解析 JSON
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  }

  /**
   * 生成完整课程
   */
  async generateCourse(
    content: string,
    courseName: string,
    config: CourseGenerationConfig,
    onProgress?: (current: number, total: number) => void
  ): Promise<Course> {
    const maps: { title: string; description: string; levels: ConceptLevel[] }[] = [];
    
    // 分块内容用于不同地图
    const chunkSize = Math.ceil(content.length / config.mapCount);
    
    for (let i = 0; i < config.mapCount; i++) {
      const chunk = content.slice(i * chunkSize, (i + 1) * chunkSize);
      onProgress?.(i + 1, config.mapCount);
      
      try {
        const mapData = await this.generateMap(chunk, config, i);
        
        // 重新编号关卡 ID
        const baseId = i * config.levelsPerMap;
        mapData.levels = mapData.levels.map((level, idx) => ({
          ...level,
          id: baseId + idx + 1,
          mapIndex: i,
          mapTitle: mapData.mapTitle
        }));
        
        maps.push({
          title: mapData.mapTitle,
          description: mapData.mapDescription,
          levels: mapData.levels
        });
      } catch (error) {
        console.error(`地图 ${i + 1} 生成失败:`, error);
      }
      
      // 避免 API 限流
      await new Promise(r => setTimeout(r, 1000));
    }

    // 组装课程
    const allLevels = maps.flatMap(m => m.levels);
    
    return {
      id: `custom-${Date.now()}`,
      name: courseName,
      icon: '📚',
      description: `自定义课程 - ${config.mapCount} 张地图，${allLevels.length} 个关卡`,
      type: 'concept',
      maps: maps.map((m, i) => ({
        id: i,
        title: m.title,
        description: m.description,
        levelCount: m.levels.length
      })),
      levels: allLevels,
      config: config,
      createdAt: new Date().toISOString(),
      isCustom: true
    };
  }
}

export const courseGeneratorService = new CourseGeneratorService();
```

### 📤 Output
- `src/services/courseGeneratorService.ts`

---

## Step A.3: 课程创建向导 UI

### 📐 Spec

```typescript
// ============================================================
// 文件: src/components/course/CourseCreator.tsx
// ============================================================

import React, { useState } from 'react';
import { importService, ImportResult } from '../../services/importService';
import { courseGeneratorService, CourseGenerationConfig, DEFAULT_CONFIG } from '../../services/courseGeneratorService';
import { Course } from '../../types';

interface CourseCreatorProps {
  onComplete: (course: Course) => void;
  onCancel: () => void;
}

type Step = 'import' | 'configure' | 'generate' | 'complete';

const CourseCreator: React.FC<CourseCreatorProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<Step>('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [config, setConfig] = useState<CourseGenerationConfig>(DEFAULT_CONFIG);
  const [courseName, setCourseName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // === 导入处理 ===
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await importService.import({ type: 'pdf', content: file });
    setImportResult(result);
    setCourseName(result.metadata.title);
  };

  const handleMarkdownPaste = (text: string) => {
    const result = importService.parseMarkdown(text);
    setImportResult(result);
    setCourseName(result.metadata.title || '自定义课程');
  };

  const handleURLFetch = async (url: string) => {
    const result = await importService.import({ type: 'url', content: url });
    setImportResult(result);
    setCourseName(result.metadata.title);
  };

  // === 生成课程 ===
  const handleGenerate = async () => {
    if (!importResult?.text) return;
    
    setGenerating(true);
    setStep('generate');
    
    try {
      const course = await courseGeneratorService.generateCourse(
        importResult.text,
        courseName,
        config,
        (current, total) => setProgress({ current, total })
      );
      
      // 保存到 localStorage
      const customCourses = JSON.parse(localStorage.getItem('zlearn_custom_courses') || '[]');
      customCourses.push(course);
      localStorage.setItem('zlearn_custom_courses', JSON.stringify(customCourses));
      
      setStep('complete');
      onComplete(course);
    } catch (error) {
      console.error('课程生成失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* 标题栏 */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">✨ 创建自定义课程</h2>
          <p className="text-slate-400 mt-1">导入内容，AI 自动生成闯关题目</p>
        </div>

        {/* Step 1: 导入 */}
        {step === 'import' && (
          <div className="p-6 space-y-6">
            {/* PDF 上传 */}
            <div>
              <label className="block text-sm font-medium mb-2">📄 上传 PDF 文档</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full p-3 bg-slate-700 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white"
              />
            </div>

            {/* Markdown 粘贴 */}
            <div>
              <label className="block text-sm font-medium mb-2">📝 粘贴 Markdown 内容</label>
              <textarea
                rows={4}
                placeholder="在此粘贴 Markdown 文本..."
                onChange={(e) => handleMarkdownPaste(e.target.value)}
                className="w-full p-3 bg-slate-700 rounded-xl resize-none"
              />
            </div>

            {/* URL 输入 */}
            <div>
              <label className="block text-sm font-medium mb-2">🌐 输入网页 URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/docs"
                  className="flex-1 p-3 bg-slate-700 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleURLFetch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                    if (input?.value) handleURLFetch(input.value);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  抓取
                </button>
              </div>
            </div>

            {/* 导入结果预览 */}
            {importResult && (
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <span>✓</span>
                  <span className="font-medium">{importResult.metadata.title}</span>
                </div>
                <div className="text-sm text-slate-400">
                  约 {importResult.metadata.wordCount} 字 · 
                  预估 {importResult.metadata.estimatedTokens} Token
                </div>
              </div>
            )}

            {/* 下一步按钮 */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={() => setStep('configure')}
                disabled={!importResult?.success}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-xl font-bold"
              >
                下一步: 配置课程
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 配置 */}
        {step === 'configure' && (
          <div className="p-6 space-y-6">
            {/* 课程名称 */}
            <div>
              <label className="block text-sm font-medium mb-2">课程名称</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-3 bg-slate-700 rounded-xl"
              />
            </div>

            {/* 地图数量 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                地图数量: <span className="text-blue-400">{config.mapCount}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={config.mapCount}
                onChange={(e) => setConfig({ ...config, mapCount: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* 每地图关卡数 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                每地图关卡: <span className="text-blue-400">{config.levelsPerMap}</span>
              </label>
              <input
                type="range"
                min={5}
                max={20}
                value={config.levelsPerMap}
                onChange={(e) => setConfig({ ...config, levelsPerMap: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            {/* 难度分布 */}
            <div>
              <label className="block text-sm font-medium mb-2">难度分布模式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'uniform', label: '均匀', icon: '⚖️' },
                  { value: 'progressive', label: '递增', icon: '📈' },
                  { value: 'random', label: '随机', icon: '🎲' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setConfig({ ...config, difficultyMode: opt.value as any })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      config.difficultyMode === opt.value
                        ? 'bg-blue-600 ring-2 ring-blue-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 做题模式 */}
            <div>
              <label className="block text-sm font-medium mb-2">做题模式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'sequential', label: '顺序', icon: '➡️' },
                  { value: 'random', label: '随机', icon: '🔀' },
                  { value: 'adaptive', label: '自适应', icon: '🧠' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setConfig({ ...config, questionMode: opt.value as any })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      config.questionMode === opt.value
                        ? 'bg-blue-600 ring-2 ring-blue-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 预览 */}
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <h4 className="font-medium mb-2">📊 课程预览</h4>
              <p className="text-sm text-slate-400">
                将生成 <span className="text-white font-bold">{config.mapCount}</span> 张地图，
                共 <span className="text-white font-bold">{config.mapCount * config.levelsPerMap}</span> 个关卡
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('import')}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl"
              >
                上一步
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold"
              >
                🚀 开始生成
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 生成中 */}
        {step === 'generate' && (
          <div className="p-6 text-center space-y-6">
            <div className="text-6xl animate-bounce">🤖</div>
            <h3 className="text-xl font-bold">AI 正在生成课程...</h3>
            <p className="text-slate-400">
              正在生成第 {progress.current} / {progress.total} 张地图
            </p>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-500">
              预计需要 {progress.total * 3} 秒，请耐心等待
            </p>
          </div>
        )}

        {/* Step 4: 完成 */}
        {step === 'complete' && (
          <div className="p-6 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold">课程创建成功！</h3>
            <p className="text-slate-400">
              "{courseName}" 已添加到你的课程列表
            </p>
            <button
              onClick={onCancel}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold"
            >
              开始学习
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseCreator;
```

### 📤 Output
- `src/components/course/CourseCreator.tsx`

---

## Step A.4: 动态课程管理

### 📐 Spec

在 `App.tsx` 或 `LevelMap.tsx` 中集成自定义课程：

```typescript
// 获取所有课程（内置 + 自定义）
const getAllCourses = (): Course[] => {
  const builtinCourses = [PYTHON_COURSE, ZEABUR_COURSE];
  const customCourses = JSON.parse(localStorage.getItem('zlearn_custom_courses') || '[]');
  return [...builtinCourses, ...customCourses];
};

// 删除自定义课程
const deleteCustomCourse = (courseId: string) => {
  const courses = JSON.parse(localStorage.getItem('zlearn_custom_courses') || '[]');
  const filtered = courses.filter((c: Course) => c.id !== courseId);
  localStorage.setItem('zlearn_custom_courses', JSON.stringify(filtered));
};
```

---

# PHASE C: 游戏化配置系统

> **设计原则**: 像游戏开发一样，所有关卡参数都通过配置文件暴露，实现"数据驱动"的关卡设计。

## C.1 架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION SYSTEM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   配置文件层                                                         │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📁 /config/                                                 │  │
│   │  ├── game.config.json        # 全局游戏机制                   │  │
│   │  ├── courses/                # 课程配置目录                   │  │
│   │  │   ├── python.course.json  # Python 课程定义               │  │
│   │  │   ├── zeabur.course.json  # Zeabur 课程定义               │  │
│   │  │   └── custom/             # 用户自定义课程                 │  │
│   │  ├── ai.config.json          # AI 服务配置                   │  │
│   │  └── audio.config.json       # 音效配置                       │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  🔧 ConfigService                                            │  │
│   │  • loadConfig(): 加载所有配置文件                             │  │
│   │  • get(path): 获取配置项 (支持点号路径)                       │  │
│   │  • override(path, value): 运行时覆盖                          │  │
│   │  • reset(): 重置为默认值                                      │  │
│   │  • watch(path, callback): 监听配置变化                        │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  🎮 游戏运行时                                               │  │
│   │  • 关卡难度参数动态读取                                       │  │
│   │  • 评分规则可配置                                             │  │
│   │  • AI 行为可调整                                              │  │
│   │  • 用户可通过 localStorage 覆盖                               │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step C.1: 课程/关卡配置文件设计

### 📐 Spec

#### 全局游戏配置 (game.config.json)

```json
{
  "$schema": "./schemas/game.schema.json",
  "version": "2.0.0",
  
  "scoring": {
    "baseScore": 1000,
    "timeBonusMultiplier": 20,
    "starRules": {
      "firstAttempt": 3,
      "secondAttempt": 2,
      "thirdOrMore": 1
    },
    "xpRewards": {
      "level1Star": 500,
      "level2Star": 750,
      "level3Star": 1000,
      "mapComplete": 500,
      "courseComplete": 2000
    }
  },
  
  "difficulty": {
    "easy": {
      "timeLimit": 0,
      "hintsAllowed": 3,
      "penaltyPerWrong": 0,
      "showExplanation": true
    },
    "medium": {
      "timeLimit": 60,
      "hintsAllowed": 2,
      "penaltyPerWrong": 100,
      "showExplanation": true
    },
    "hard": {
      "timeLimit": 45,
      "hintsAllowed": 1,
      "penaltyPerWrong": 200,
      "showExplanation": false
    }
  },
  
  "progression": {
    "unlockMode": "sequential",
    "requireStarsToUnlock": 0,
    "allowReplay": true,
    "autoAdvance": true,
    "autoAdvanceDelay": 1500
  },
  
  "coach": {
    "defaultPersona": "professional",
    "defaultVoice": "zh-CN-XiaoxiaoNeural",
    "autoReadQuestion": true,
    "showHintAfterWrong": 2
  },
  
  "review": {
    "showAfterLevel": true,
    "showAfterMap": true,
    "aiSummaryEnabled": true
  }
}
```

#### 课程配置 (zeabur.course.json) - 完整示例

```json
{
  "$schema": "../schemas/course.schema.json",
  "id": "zeabur",
  "version": "1.0.0",
  
  "metadata": {
    "name": "Zeabur 云平台速成",
    "icon": "☁️",
    "description": "快速掌握 Zeabur 部署平台核心概念",
    "author": "Lalalearn Team",
    "tags": ["云计算", "部署", "DevOps"],
    "difficulty": "beginner",
    "estimatedTime": "30分钟",
    "targetAudience": ["市场人员", "销售人员", "新员工"]
  },
  
  "settings": {
    "type": "concept",
    "questionModes": ["single_choice", "true_false", "fill_blank"],
    "difficultyProgression": "progressive",
    "shuffleQuestions": false,
    "allowSkip": false
  },
  
  "maps": [
    {
      "id": 0,
      "title": "🚀 平台入门",
      "description": "了解 Zeabur 是什么",
      "unlockCondition": null,
      "bonusXP": 500
    },
    {
      "id": 1,
      "title": "⚡ 核心功能",
      "description": "掌握一键部署等核心能力",
      "unlockCondition": { "mapId": 0, "minStars": 5 },
      "bonusXP": 600
    }
  ],
  
  "levels": [
    {
      "id": 1,
      "mapIndex": 0,
      "title": "什么是 Zeabur？",
      "description": "认识 Zeabur 平台定位",
      "difficulty": "easy",
      
      "config": {
        "timeLimit": 0,
        "maxAttempts": 0,
        "showHints": true,
        "hintCost": 0,
        "xpBase": 100,
        "xpBonus": {
          "noHint": 20,
          "fastComplete": 30,
          "firstTry": 50
        }
      },
      
      "question": {
        "type": "single_choice",
        "question": "Zeabur 是一个什么类型的平台？",
        "options": [
          { "key": "A", "text": "社交媒体平台" },
          { "key": "B", "text": "云端应用部署平台" },
          { "key": "C", "text": "在线文档编辑器" },
          { "key": "D", "text": "电商购物平台" }
        ],
        "correctAnswer": "B",
        "explanation": "Zeabur 是一个现代化的云端应用部署平台，让开发者可以轻松部署各种应用。",
        "hints": [
          "想想 Zeabur 主要帮助开发者做什么",
          "它跟服务器部署有关"
        ]
      },
      
      "coaching": {
        "introMessage": "让我们先来认识一下 Zeabur 是什么吧！",
        "successMessage": "没错！Zeabur 就是帮你一键部署应用的平台！",
        "failMessage": "再想想，Zeabur 是帮助开发者部署应用的...",
        "contextTags": ["platform", "introduction"]
      }
    },
    {
      "id": 2,
      "mapIndex": 0,
      "title": "核心优势",
      "description": "了解 Zeabur 的关键特点",
      "difficulty": "easy",
      
      "config": {
        "timeLimit": 0,
        "maxAttempts": 0,
        "showHints": true
      },
      
      "question": {
        "type": "true_false",
        "statement": "Zeabur 需要用户手动配置 CI/CD 流水线才能部署应用。",
        "correctAnswer": false,
        "explanation": "Zeabur 最大的优势就是开箱即用的 CI/CD，无需手动配置即可自动构建部署。"
      }
    }
  ]
}
```

#### 关卡配置类型定义

```typescript
// ============================================================
// 文件: src/types/config.ts
// ============================================================

/** 关卡配置 */
export interface LevelConfig {
  timeLimit: number;           // 时间限制 (秒), 0=无限制
  maxAttempts: number;         // 最大尝试次数, 0=无限制
  showHints: boolean;          // 是否显示提示
  hintCost: number;            // 每次提示扣分
  xpBase: number;              // 基础经验值
  xpBonus: {
    noHint: number;            // 不用提示奖励
    fastComplete: number;      // 快速完成奖励
    firstTry: number;          // 一次通过奖励
  };
}

/** 教练配置 */
export interface CoachingConfig {
  introMessage?: string;       // 关卡开始消息
  successMessage?: string;     // 成功消息
  failMessage?: string;        // 失败消息
  contextTags?: string[];      // 上下文标签
}

/** 完整关卡定义 */
export interface LevelDefinition {
  id: number;
  mapIndex: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  config: LevelConfig;
  question: QuestionDefinition;
  coaching?: CoachingConfig;
}

/** 课程元数据 */
export interface CourseMetadata {
  name: string;
  icon: string;
  description: string;
  author: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  targetAudience: string[];
}

/** 完整课程配置 */
export interface CourseConfig {
  id: string;
  version: string;
  metadata: CourseMetadata;
  settings: CourseSettings;
  maps: MapDefinition[];
  levels: LevelDefinition[];
}
```

### 📤 Output
- `src/types/config.ts`
- `config/game.config.json`
- `config/courses/zeabur.course.json`

---

## Step C.2: 配置服务 (configService)

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/configService.ts
// ============================================================

import type { CourseConfig, LevelConfig } from '../types/config';

// 静态导入默认配置
import defaultGameConfig from '../config/game.config.json';
import zeaburCourse from '../config/courses/zeabur.course.json';
import pythonCourse from '../config/courses/python.course.json';

export interface GameConfig {
  scoring: {
    baseScore: number;
    timeBonusMultiplier: number;
    starRules: { firstAttempt: number; secondAttempt: number; thirdOrMore: number };
    xpRewards: Record<string, number>;
  };
  difficulty: Record<string, {
    timeLimit: number;
    hintsAllowed: number;
    penaltyPerWrong: number;
    showExplanation: boolean;
  }>;
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

class ConfigService {
  private gameConfig: GameConfig;
  private courses: Map<string, CourseConfig> = new Map();
  private overrides: Record<string, any> = {};
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  constructor() {
    // 加载默认配置
    this.gameConfig = defaultGameConfig as GameConfig;
    
    // 加载内置课程
    this.courses.set('zeabur', zeaburCourse as CourseConfig);
    this.courses.set('python', pythonCourse as CourseConfig);
    
    // 从 localStorage 恢复用户覆盖
    this.loadOverrides();
  }

  // === 游戏配置访问 ===
  
  /**
   * 获取配置值 (支持点号路径)
   * @example config.get('scoring.baseScore') => 1000
   */
  get<T = any>(path: string): T {
    // 先检查覆盖值
    if (path in this.overrides) {
      return this.overrides[path] as T;
    }
    
    // 从配置中读取
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

  /**
   * 运行时覆盖配置 (保存到 localStorage)
   */
  override(path: string, value: any): void {
    this.overrides[path] = value;
    this.saveOverrides();
    this.notifyListeners(path, value);
  }

  /**
   * 重置指定配置项
   */
  reset(path?: string): void {
    if (path) {
      delete this.overrides[path];
    } else {
      this.overrides = {};
    }
    this.saveOverrides();
  }

  /**
   * 监听配置变化
   */
  watch(path: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(callback);
    
    // 返回取消监听函数
    return () => {
      this.listeners.get(path)?.delete(callback);
    };
  }

  // === 课程配置访问 ===

  /**
   * 获取课程配置
   */
  getCourse(courseId: string): CourseConfig | undefined {
    return this.courses.get(courseId);
  }

  /**
   * 获取所有课程
   */
  getAllCourses(): CourseConfig[] {
    return Array.from(this.courses.values());
  }

  /**
   * 注册自定义课程
   */
  registerCourse(course: CourseConfig): void {
    this.courses.set(course.id, course);
  }

  /**
   * 获取关卡配置 (合并全局默认值)
   */
  getLevelConfig(courseId: string, levelId: number): LevelConfig {
    const course = this.courses.get(courseId);
    const level = course?.levels.find(l => l.id === levelId);
    const difficulty = level?.difficulty || 'easy';
    
    // 合并: 全局默认 -> 难度默认 -> 关卡自定义
    const globalDefaults = this.get<GameConfig['difficulty'][string]>(`difficulty.${difficulty}`);
    const levelConfig = level?.config || {};
    
    return {
      timeLimit: levelConfig.timeLimit ?? globalDefaults?.timeLimit ?? 0,
      maxAttempts: levelConfig.maxAttempts ?? 0,
      showHints: levelConfig.showHints ?? true,
      hintCost: levelConfig.hintCost ?? 0,
      xpBase: levelConfig.xpBase ?? 100,
      xpBonus: levelConfig.xpBonus ?? { noHint: 20, fastComplete: 30, firstTry: 50 }
    };
  }

  // === 私有方法 ===

  private loadOverrides(): void {
    try {
      const saved = localStorage.getItem('lalalearn_config_overrides');
      if (saved) {
        this.overrides = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load config overrides:', e);
    }
  }

  private saveOverrides(): void {
    localStorage.setItem('lalalearn_config_overrides', JSON.stringify(this.overrides));
  }

  private notifyListeners(path: string, value: any): void {
    this.listeners.get(path)?.forEach(cb => cb(value));
  }
}

export const configService = new ConfigService();

// React Hook
export function useConfig<T = any>(path: string): T {
  const [value, setValue] = React.useState<T>(() => configService.get<T>(path));
  
  React.useEffect(() => {
    return configService.watch(path, setValue);
  }, [path]);
  
  return value;
}
```

### 📤 Output
- `src/services/configService.ts`

---

## Step C.3: 配置热加载与运行时覆盖

### 📐 Spec

在 `App.tsx` 中集成配置服务：

```typescript
// 在 App.tsx 中使用配置
import { configService, useConfig } from './services/configService';

function App() {
  // 使用 Hook 读取配置
  const autoAdvance = useConfig<boolean>('progression.autoAdvance');
  const autoAdvanceDelay = useConfig<number>('progression.autoAdvanceDelay');
  
  // 或直接调用
  const starRules = configService.get('scoring.starRules');
  
  // 根据配置计算星星
  const calculateStars = (attempts: number): number => {
    if (attempts === 1) return starRules.firstAttempt;
    if (attempts === 2) return starRules.secondAttempt;
    return starRules.thirdOrMore;
  };
  
  // 获取关卡配置
  const levelConfig = configService.getLevelConfig('zeabur', currentLevel);
  
  // ...
}
```

### 配置迁移: 将现有硬编码改为配置

```typescript
// 之前 (硬编码)
const getStars = (attempts: number) => {
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
};

// 之后 (配置驱动)
const getStars = (attempts: number) => {
  const rules = configService.get('scoring.starRules');
  if (attempts <= 1) return rules.firstAttempt;
  if (attempts === 2) return rules.secondAttempt;
  return rules.thirdOrMore;
};
```

---

## Step C.4: 配置编辑器 UI (可选)

### 📐 Spec

```typescript
// ============================================================
// 文件: src/components/settings/ConfigEditor.tsx
// ============================================================

import React, { useState } from 'react';
import { configService, GameConfig } from '../../services/configService';

interface ConfigEditorProps {
  onClose: () => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ onClose }) => {
  // 可编辑的配置项
  const [starRules, setStarRules] = useState({
    firstAttempt: configService.get<number>('scoring.starRules.firstAttempt'),
    secondAttempt: configService.get<number>('scoring.starRules.secondAttempt'),
    thirdOrMore: configService.get<number>('scoring.starRules.thirdOrMore')
  });
  
  const [autoAdvance, setAutoAdvance] = useState(
    configService.get<boolean>('progression.autoAdvance')
  );
  
  const [autoReadQuestion, setAutoReadQuestion] = useState(
    configService.get<boolean>('coach.autoReadQuestion')
  );

  const handleSave = () => {
    configService.override('scoring.starRules.firstAttempt', starRules.firstAttempt);
    configService.override('scoring.starRules.secondAttempt', starRules.secondAttempt);
    configService.override('scoring.starRules.thirdOrMore', starRules.thirdOrMore);
    configService.override('progression.autoAdvance', autoAdvance);
    configService.override('coach.autoReadQuestion', autoReadQuestion);
    onClose();
  };

  const handleReset = () => {
    configService.reset();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">⚙️ 游戏配置</h2>
          <p className="text-sm text-slate-400 mt-1">调整游戏参数 (修改后立即生效)</p>
        </div>

        <div className="p-6 space-y-6">
          {/* 星星规则 */}
          <div>
            <h3 className="font-medium mb-3">⭐ 星星评分规则</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400">首次通过</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={starRules.firstAttempt}
                  onChange={(e) => setStarRules({ ...starRules, firstAttempt: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">第二次通过</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={starRules.secondAttempt}
                  onChange={(e) => setStarRules({ ...starRules, secondAttempt: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">三次及以上</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={starRules.thirdOrMore}
                  onChange={(e) => setStarRules({ ...starRules, thirdOrMore: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 自动功能 */}
          <div className="space-y-3">
            <h3 className="font-medium">🔄 自动功能</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span>答对后自动进入下一关</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReadQuestion}
                onChange={(e) => setAutoReadQuestion(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span>自动朗读题目</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg"
          >
            重置默认
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
```

### 📤 Output
- `src/components/settings/ConfigEditor.tsx`

---

## C.5 课程配置与 constants.ts 迁移

### 迁移计划

将现有 `constants.ts` 中的课程数据迁移到 JSON 配置文件：

```typescript
// 之前 (constants.ts)
export const ZEABUR_COURSE = {
  id: 'zeabur',
  name: 'Zeabur 云平台速成',
  // ...100 个关卡硬编码
};

// 之后 (config/courses/zeabur.course.json)
// 全部关卡数据移到 JSON 文件
// constants.ts 只保留纯静态常量 (如音效 URL)
```

### 迁移步骤

1. 创建 `config/courses/` 目录
2. 将 `ZEABUR_COURSE` 导出为 `zeabur.course.json`
3. 将 `PYTHON_LEVELS` 导出为 `python.course.json`
4. 更新 `configService` 加载这些文件
5. 修改 `App.tsx` 和 `LevelMap.tsx` 使用 `configService.getCourse()`

---

# PHASE B: 数据持久化与分析

## B.1 架构设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                   DATA ANALYTICS ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   用户行为                                                           │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📊 埋点事件                                                  │  │
│   │  • 页面访问  • 答题行为  • 学习时长  • 错误率                 │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  💾 IndexedDB 存储                                           │  │
│   │  • events: 埋点事件                                          │  │
│   │  • users: 用户数据                                           │  │
│   │  • progress: 学习进度                                        │  │
│   │  • analytics: 分析汇总                                       │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  📈 分析引擎                                                  │  │
│   │  • 留存分析 (D1/D7/D30)                                      │  │
│   │  • 学习习惯 (时段/时长/频率)                                  │  │
│   │  • 卡点分析 (错题/放弃)                                       │  │
│   │  • 行为漏斗                                                   │  │
│   └───────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │  ☁️ Zeabur 备份 (手动导出/定时)                               │  │
│   │  • JSON 导出下载                                             │  │
│   │  • 可选: 上传到 Zeabur Object Storage                        │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step B.1: IndexedDB 存储服务

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/storageService.ts
// ============================================================

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'zlearn_db';
const DB_VERSION = 1;

export interface AnalyticsEvent {
  id: string;
  type: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface UserProgress {
  id: string;
  courseId: string;
  levelId: number;
  stars: number;
  attempts: number;
  timeSpent: number;
  completedAt: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  levelsCompleted: number;
  correctAnswers: number;
  wrongAnswers: number;
}

class StorageService {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 埋点事件表
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('type', 'type');
          eventStore.createIndex('userId', 'userId');
          eventStore.createIndex('timestamp', 'timestamp');
        }

        // 学习进度表
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('courseId', 'courseId');
          progressStore.createIndex('userId', 'userId');
        }

        // 学习会话表
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('userId', 'userId');
          sessionStore.createIndex('startTime', 'startTime');
        }

        // 自定义课程表
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
      }
    });
  }

  // === 埋点事件 ===
  async addEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<string> {
    const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await this.db?.put('events', { ...event, id });
    return id;
  }

  async getEvents(
    filter?: { type?: string; userId?: string; startTime?: number; endTime?: number }
  ): Promise<AnalyticsEvent[]> {
    let events = await this.db?.getAll('events') || [];
    
    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter?.userId) {
      events = events.filter(e => e.userId === filter.userId);
    }
    if (filter?.startTime) {
      events = events.filter(e => e.timestamp >= filter.startTime!);
    }
    if (filter?.endTime) {
      events = events.filter(e => e.timestamp <= filter.endTime!);
    }
    
    return events;
  }

  // === 学习进度 ===
  async saveProgress(progress: UserProgress): Promise<void> {
    await this.db?.put('progress', progress);
  }

  async getProgress(userId: string, courseId?: string): Promise<UserProgress[]> {
    let progress = await this.db?.getAll('progress') || [];
    progress = progress.filter(p => p.userId === userId);
    if (courseId) {
      progress = progress.filter(p => p.courseId === courseId);
    }
    return progress;
  }

  // === 学习会话 ===
  async startSession(userId: string): Promise<string> {
    const id = `sess_${Date.now()}`;
    await this.db?.put('sessions', {
      id,
      userId,
      startTime: Date.now(),
      duration: 0,
      levelsCompleted: 0,
      correctAnswers: 0,
      wrongAnswers: 0
    });
    return id;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await this.db?.get('sessions', sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      await this.db?.put('sessions', session);
    }
  }

  // === 数据导出 (备份) ===
  async exportAllData(): Promise<string> {
    const data = {
      exportedAt: new Date().toISOString(),
      events: await this.db?.getAll('events'),
      progress: await this.db?.getAll('progress'),
      sessions: await this.db?.getAll('sessions'),
      courses: await this.db?.getAll('courses')
    };
    return JSON.stringify(data, null, 2);
  }

  // === 数据导入 (恢复) ===
  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    
    if (data.events) {
      for (const event of data.events) {
        await this.db?.put('events', event);
      }
    }
    if (data.progress) {
      for (const prog of data.progress) {
        await this.db?.put('progress', prog);
      }
    }
    if (data.sessions) {
      for (const session of data.sessions) {
        await this.db?.put('sessions', session);
      }
    }
    if (data.courses) {
      for (const course of data.courses) {
        await this.db?.put('courses', course);
      }
    }
  }

  // === 清理旧数据 ===
  async cleanOldEvents(daysToKeep: number = 30): Promise<number> {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const events = await this.getEvents({ endTime: cutoff });
    
    for (const event of events) {
      await this.db?.delete('events', event.id);
    }
    
    return events.length;
  }
}

export const storageService = new StorageService();
```

### 📤 Output
- `src/services/storageService.ts`

---

## Step B.2: 埋点事件收集

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/analyticsService.ts
// ============================================================

import { storageService, AnalyticsEvent } from './storageService';
import { v4 as uuid } from 'uuid';

// 预定义事件类型
export const EVENTS = {
  // 页面事件
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',

  // 课程事件
  COURSE_SELECT: 'course_select',
  COURSE_CREATE: 'course_create',

  // 学习事件
  LEVEL_START: 'level_start',
  LEVEL_COMPLETE: 'level_complete',
  LEVEL_FAIL: 'level_fail',
  LEVEL_ABANDON: 'level_abandon',

  // 答题事件
  ANSWER_SUBMIT: 'answer_submit',
  ANSWER_CORRECT: 'answer_correct',
  ANSWER_WRONG: 'answer_wrong',
  HINT_REQUEST: 'hint_request',

  // 教练事件
  COACH_CHAT: 'coach_chat',
  COACH_TTS: 'coach_tts',

  // 复盘事件
  REVIEW_OPEN: 'review_open',
  REVIEW_AI_SUMMARY: 'review_ai_summary'
} as const;

class AnalyticsService {
  private userId: string = '';
  private sessionId: string = '';
  private eventQueue: Omit<AnalyticsEvent, 'id'>[] = [];
  private flushTimer: number | null = null;

  init(userId: string) {
    this.userId = userId;
    this.sessionId = uuid();
    this.track(EVENTS.SESSION_START, {});
    
    // 每 10 秒批量写入
    this.flushTimer = window.setInterval(() => this.flush(), 10000);
    
    // 页面关闭前写入
    window.addEventListener('beforeunload', () => {
      this.track(EVENTS.SESSION_END, {});
      this.flush();
    });
  }

  track(type: string, data: Record<string, any>) {
    this.eventQueue.push({
      type,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data
    });

    // 重要事件立即写入
    if ([EVENTS.LEVEL_COMPLETE, EVENTS.SESSION_END].includes(type as any)) {
      this.flush();
    }
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    for (const event of events) {
      await storageService.addEvent(event);
    }
  }

  // === 便捷方法 ===
  trackPageView(page: string) {
    this.track(EVENTS.PAGE_VIEW, { page });
  }

  trackLevelStart(courseId: string, levelId: number) {
    this.track(EVENTS.LEVEL_START, { courseId, levelId, startTime: Date.now() });
  }

  trackLevelComplete(courseId: string, levelId: number, stars: number, timeSpent: number) {
    this.track(EVENTS.LEVEL_COMPLETE, { courseId, levelId, stars, timeSpent });
  }

  trackAnswer(courseId: string, levelId: number, correct: boolean, attemptNumber: number) {
    this.track(correct ? EVENTS.ANSWER_CORRECT : EVENTS.ANSWER_WRONG, {
      courseId,
      levelId,
      attemptNumber
    });
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const analyticsService = new AnalyticsService();
```

### 📤 Output
- `src/services/analyticsService.ts`

---

## Step B.3: 留存/学习分析引擎

### 📐 Spec

```typescript
// ============================================================
// 文件: src/services/analysisService.ts
// ============================================================

import { storageService, AnalyticsEvent } from './storageService';
import { EVENTS } from './analyticsService';

export interface RetentionData {
  d1: number;  // 次日留存率 %
  d7: number;  // 7日留存率 %
  d30: number; // 30日留存率 %
}

export interface LearningHabits {
  preferredHours: number[];   // 偏好学习时段
  avgSessionDuration: number; // 平均学习时长 (分钟)
  avgLevelsPerSession: number; // 每次学习完成关卡数
  weeklyFrequency: number;    // 周学习频率
}

export interface BottleneckAnalysis {
  levelId: number;
  courseId: string;
  failRate: number;      // 失败率 %
  avgAttempts: number;   // 平均尝试次数
  abandonRate: number;   // 放弃率 %
}

class AnalysisService {
  /**
   * 计算留存率
   */
  async calculateRetention(userId: string): Promise<RetentionData> {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    const sessions = await storageService.getEvents({
      userId,
      type: EVENTS.SESSION_START
    });
    
    if (sessions.length === 0) {
      return { d1: 0, d7: 0, d30: 0 };
    }
    
    const firstSession = Math.min(...sessions.map(s => s.timestamp));
    const daysSinceFirst = Math.floor((now - firstSession) / day);
    
    // 检查指定天数后是否有活动
    const hasActivityAfter = (days: number) => {
      const targetTime = firstSession + days * day;
      return sessions.some(s => s.timestamp >= targetTime && s.timestamp < targetTime + day);
    };
    
    return {
      d1: daysSinceFirst >= 1 && hasActivityAfter(1) ? 100 : 0,
      d7: daysSinceFirst >= 7 && hasActivityAfter(7) ? 100 : 0,
      d30: daysSinceFirst >= 30 && hasActivityAfter(30) ? 100 : 0
    };
  }

  /**
   * 分析学习习惯
   */
  async analyzeLearningHabits(userId: string): Promise<LearningHabits> {
    const events = await storageService.getEvents({ userId });
    
    // 统计学习时段
    const hourCounts: number[] = new Array(24).fill(0);
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour]++;
    });
    
    // 找出偏好时段 (活动最多的 3 个小时)
    const preferredHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => h.hour);
    
    // 计算平均会话时长
    const sessions = events.filter(e => e.type === EVENTS.SESSION_START);
    const sessionEnds = events.filter(e => e.type === EVENTS.SESSION_END);
    
    let totalDuration = 0;
    sessions.forEach(start => {
      const end = sessionEnds.find(e => 
        e.sessionId === start.sessionId && e.timestamp > start.timestamp
      );
      if (end) {
        totalDuration += end.timestamp - start.timestamp;
      }
    });
    
    const avgSessionDuration = sessions.length > 0 
      ? Math.round(totalDuration / sessions.length / 60000) 
      : 0;
    
    // 计算每次学习完成关卡数
    const completions = events.filter(e => e.type === EVENTS.LEVEL_COMPLETE);
    const avgLevelsPerSession = sessions.length > 0 
      ? Math.round(completions.length / sessions.length * 10) / 10 
      : 0;
    
    // 计算周学习频率
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekSessions = sessions.filter(s => s.timestamp >= oneWeekAgo);
    const uniqueDays = new Set(
      weekSessions.map(s => new Date(s.timestamp).toDateString())
    ).size;
    
    return {
      preferredHours,
      avgSessionDuration,
      avgLevelsPerSession,
      weeklyFrequency: uniqueDays
    };
  }

  /**
   * 卡点分析
   */
  async analyzeBottlenecks(userId?: string): Promise<BottleneckAnalysis[]> {
    const filter = userId ? { userId } : undefined;
    const events = await storageService.getEvents(filter);
    
    // 按关卡分组统计
    const levelStats: Map<string, {
      starts: number;
      completes: number;
      fails: number;
      abandons: number;
      totalAttempts: number;
    }> = new Map();
    
    events.forEach(e => {
      if (![EVENTS.LEVEL_START, EVENTS.LEVEL_COMPLETE, EVENTS.LEVEL_FAIL, EVENTS.LEVEL_ABANDON].includes(e.type as any)) {
        return;
      }
      
      const key = `${e.data.courseId}-${e.data.levelId}`;
      const stats = levelStats.get(key) || {
        starts: 0, completes: 0, fails: 0, abandons: 0, totalAttempts: 0
      };
      
      switch (e.type) {
        case EVENTS.LEVEL_START:
          stats.starts++;
          break;
        case EVENTS.LEVEL_COMPLETE:
          stats.completes++;
          break;
        case EVENTS.LEVEL_FAIL:
          stats.fails++;
          stats.totalAttempts++;
          break;
        case EVENTS.LEVEL_ABANDON:
          stats.abandons++;
          break;
      }
      
      levelStats.set(key, stats);
    });
    
    // 转换为分析结果并排序
    return Array.from(levelStats.entries())
      .map(([key, stats]) => {
        const [courseId, levelId] = key.split('-');
        return {
          levelId: Number(levelId),
          courseId,
          failRate: stats.starts > 0 ? Math.round(stats.fails / stats.starts * 100) : 0,
          avgAttempts: stats.completes > 0 ? Math.round(stats.totalAttempts / stats.completes * 10) / 10 : 0,
          abandonRate: stats.starts > 0 ? Math.round(stats.abandons / stats.starts * 100) : 0
        };
      })
      .filter(a => a.failRate > 30 || a.abandonRate > 20) // 只返回有问题的关卡
      .sort((a, b) => b.failRate - a.failRate);
  }

  /**
   * 生成学习报告
   */
  async generateReport(userId: string): Promise<string> {
    const retention = await this.calculateRetention(userId);
    const habits = await this.analyzeLearningHabits(userId);
    const bottlenecks = await this.analyzeBottlenecks(userId);
    
    return `
## 📊 学习数据报告

### 留存情况
- 次日留存: ${retention.d1}%
- 7日留存: ${retention.d7}%
- 30日留存: ${retention.d30}%

### 学习习惯
- 偏好学习时段: ${habits.preferredHours.map(h => `${h}:00`).join(', ')}
- 平均每次学习时长: ${habits.avgSessionDuration} 分钟
- 平均每次完成关卡: ${habits.avgLevelsPerSession} 个
- 本周学习天数: ${habits.weeklyFrequency} 天

### 需关注的关卡
${bottlenecks.slice(0, 5).map(b => 
  `- ${b.courseId} Level ${b.levelId}: 失败率 ${b.failRate}%, 放弃率 ${b.abandonRate}%`
).join('\n')}
    `.trim();
  }
}

export const analysisService = new AnalysisService();
```

### 📤 Output
- `src/services/analysisService.ts`

---

## Step B.4: Zeabur 数据备份方案

### 📐 Spec

```typescript
// ============================================================
// 文件: src/components/settings/DataBackup.tsx
// ============================================================

import React, { useState } from 'react';
import { storageService } from '../../services/storageService';

const DataBackup: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // === 导出数据 ===
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await storageService.exportAllData();
      
      // 创建下载链接
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zlearn_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  // === 导入数据 ===
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    try {
      const text = await file.text();
      await storageService.importData(text);
      alert('数据恢复成功！');
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-xl space-y-6">
      <h3 className="text-xl font-bold">💾 数据备份</h3>
      
      {/* 导出 */}
      <div>
        <h4 className="font-medium mb-2">导出数据</h4>
        <p className="text-sm text-slate-400 mb-3">
          将学习进度、课程数据、分析数据导出为 JSON 文件
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-lg"
        >
          {exporting ? '导出中...' : '📥 导出备份'}
        </button>
      </div>
      
      {/* 导入 */}
      <div>
        <h4 className="font-medium mb-2">恢复数据</h4>
        <p className="text-sm text-slate-400 mb-3">
          从之前导出的 JSON 文件恢复数据
        </p>
        <label className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer">
          {importing ? '导入中...' : '📤 选择备份文件'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Zeabur 存储提示 */}
      <div className="p-4 bg-slate-700/50 rounded-xl">
        <h4 className="font-medium mb-2">☁️ Zeabur 云存储 (可选)</h4>
        <p className="text-sm text-slate-400 mb-2">
          可将备份文件上传到 Zeabur Object Storage 实现云端备份：
        </p>
        <ol className="text-sm text-slate-400 list-decimal list-inside space-y-1">
          <li>在 Zeabur 控制台创建 Object Storage 服务</li>
          <li>获取 Bucket 名称和 Access Key</li>
          <li>使用 S3 兼容 API 上传备份文件</li>
        </ol>
        <a
          href="https://zeabur.com/docs/zh-CN/storage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-blue-400 hover:text-blue-300"
        >
          查看 Zeabur 存储文档 →
        </a>
      </div>
    </div>
  );
};

export default DataBackup;
```

### Zeabur 部署备份方案

```markdown
## Zeabur 数据持久化方案

### 方案 1: 本地导出 + 手动上传 (推荐 MVP)
1. 用户点击"导出备份"下载 JSON 文件
2. 手动保存到本地或云盘
3. 需要恢复时选择文件导入

### 方案 2: Zeabur Object Storage (进阶)
1. 在 Zeabur 创建 Object Storage 服务
2. 配置环境变量:
   - ZEABUR_STORAGE_BUCKET
   - ZEABUR_STORAGE_KEY
   - ZEABUR_STORAGE_SECRET
3. 使用 S3 SDK 自动上传备份

### 方案 3: 外部数据库 (企业级)
1. 使用 Zeabur 的 PostgreSQL 服务
2. 将 IndexedDB 数据同步到云端
3. 支持多设备同步
```

---

## 📁 文件清单

### Phase A: 内容导入 (3 个文件)
```
src/services/
├── importService.ts           # 新增 - PDF/MD/URL 导入
├── courseGeneratorService.ts  # 新增 - AI 课程生成

src/components/course/
└── CourseCreator.tsx          # 新增 - 课程创建向导
```

### Phase C: 游戏化配置系统 (5+ 个文件)
```
config/
├── game.config.json           # 新增 - 全局游戏配置
├── courses/
│   ├── zeabur.course.json     # 新增 - Zeabur 课程配置
│   └── python.course.json     # 新增 - Python 课程配置

src/types/
└── config.ts                  # 新增 - 配置类型定义

src/services/
└── configService.ts           # 新增 - 配置加载服务

src/components/settings/
└── ConfigEditor.tsx           # 新增 - 配置编辑器 (可选)
```

### Phase B: 数据分析 (4 个文件)
```
src/services/
├── storageService.ts          # 新增 - IndexedDB 封装
├── analyticsService.ts        # 新增 - 埋点收集
├── analysisService.ts         # 新增 - 分析引擎

src/components/settings/
└── DataBackup.tsx             # 新增 - 数据备份UI
```

---

## ⏱️ 时间分配

| 步骤 | 内容 | 预估 | 优先级 |
|-----|------|-----|-------|
| A.1 | 导入服务 | 45min | P0 |
| A.2 | AI 生成服务 | 60min | P0 |
| A.3 | 创建向导 UI | 60min | P0 |
| A.4 | 动态课程管理 | 30min | P1 |
| **C.1** | **课程/关卡配置文件设计** | **45min** | **P0** |
| **C.2** | **配置服务 (configService)** | **45min** | **P0** |
| **C.3** | **配置热加载与迁移** | **30min** | **P1** |
| **C.4** | **配置编辑器 UI** | **30min** | **P2** |
| B.1 | IndexedDB 存储 | 45min | P0 |
| B.2 | 埋点收集 | 30min | P0 |
| B.3 | 分析引擎 | 45min | P1 |
| B.4 | 数据备份 | 30min | P1 |
| **总计** | | **8-10h** | |

---

## ✅ 验收清单

### Phase A 验收
- [ ] 可上传 PDF 并解析文本
- [ ] 可粘贴 Markdown 并解析
- [ ] 可输入 URL 抓取网页内容
- [ ] 配置界面可设置地图数/关卡数/难度模式
- [ ] AI 可根据内容生成课程
- [ ] 自定义课程显示在课程切换 Tab
- [ ] 自定义课程可正常闯关

### Phase C 验收 (配置系统)
- [ ] `game.config.json` 可正确加载
- [ ] 课程配置从 JSON 文件读取 (非硬编码)
- [ ] 关卡配置支持难度默认值继承
- [ ] `configService.get()` 支持点号路径访问
- [ ] `configService.override()` 可覆盖配置并持久化
- [ ] 星星评分规则从配置读取
- [ ] 自动进入下一关功能可配置
- [ ] 配置编辑器可修改参数 (可选)
- [ ] `constants.ts` 课程数据迁移至 JSON

### Phase B 验收
- [ ] IndexedDB 可存储埋点事件
- [ ] 关卡开始/完成/失败事件正确记录
- [ ] 可导出全部数据为 JSON
- [ ] 可从 JSON 恢复数据
- [ ] 留存分析数据正确计算
- [ ] 学习习惯分析结果合理

---

## 🚀 开始开发

按优先级顺序执行：

1. **Step C.1**: `config/game.config.json` + `config/courses/*.json` - 配置文件结构
2. **Step C.2**: `configService.ts` - 配置加载服务
3. **Step A.1**: `importService.ts` - 内容导入核心
4. **Step B.1**: `storageService.ts` - 数据存储基础
5. **Step A.2**: `courseGeneratorService.ts` - AI 生成
6. **Step B.2**: `analyticsService.ts` - 埋点收集
7. **Step A.3**: `CourseCreator.tsx` - 创建向导 UI
8. **Step C.3**: 将 `constants.ts` 课程数据迁移至 JSON
9. **Step B.3**: `analysisService.ts` - 分析引擎
10. **Step A.4**: 动态课程管理集成
11. **Step B.4**: `DataBackup.tsx` - 备份 UI
12. **Step C.4**: `ConfigEditor.tsx` - 配置编辑器 (可选)

**开始吧！** 🎯

---

## 💡 配置系统核心价值

### 为什么要配置化？

| 硬编码方式 | 配置化方式 |
|-----------|-----------|
| 修改关卡需重新构建 | 修改 JSON 即时生效 |
| 参数散落在代码各处 | 参数集中管理 |
| 非技术人员无法调整 | 运营人员可自助配置 |
| A/B 测试困难 | 配置切换即可测试 |
| 每个课程需写代码 | 复制 JSON 即可创建 |

### 配置系统设计原则

1. **数据驱动**: 关卡内容、难度参数全部外置
2. **默认值继承**: 难度级别 → 全局默认 → 关卡覆盖
3. **运行时覆盖**: 用户可在设置中调整，存入 localStorage
4. **类型安全**: TypeScript 类型定义确保配置正确
5. **热加载**: 未来支持不重启应用刷新配置

