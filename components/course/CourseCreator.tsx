import React, { useState } from 'react';
import { importService, ImportResult } from '../../services/importService';
import { courseGeneratorService, CourseGenerationConfig, DEFAULT_CONFIG } from '../../services/courseGeneratorService';
import { crawlerService, CrawledPage } from '../../services/crawlerService';
import { Course } from '../../types';
import { configService } from '../../services/configService';

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
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [pages, setPages] = useState<CrawledPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [crawlUrl, setCrawlUrl] = useState<string>('');
  const [crawlDepth, setCrawlDepth] = useState<number>(2);
  const [crawlMax, setCrawlMax] = useState<number>(50);
  const [isCrawling, setIsCrawling] = useState(false);
  const [sourceType, setSourceType] = useState<'file' | 'paste' | 'url' | 'crawl' | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    // 选择本地文件时清空上一轮的抓取页面选择，避免复用旧的 URL 页面
    setPages([]);
    setSelectedPages(new Set());
    setCrawlUrl('');
    setSourceType('file');
    if (ext === 'pdf') {
      const result = await importService.import({ type: 'pdf', content: file });
      setImportResult(result);
      setCourseName(result.metadata.title || file.name.replace(/\.pdf$/i, ''));
    } else {
      const text = await file.text();
      const result = await importService.import({ type: 'plain', content: text, name: file.name });
      setImportResult(result);
      setCourseName(result.metadata.title || file.name);
    }
  };

  const handleMarkdownPaste = (text: string) => {
    const result = importService.parseMarkdown(text);
    setImportResult(result);
    setCourseName(result.metadata.title || '自定义课程');
    // 粘贴纯文本/Markdown 时清空上一轮的抓取页面选择
    setPages([]);
    setSelectedPages(new Set());
    setCrawlUrl('');
    setSourceType('paste');
  };

  const handleURLFetch = async (url: string) => {
    if (!url) return;
    const result = await importService.import({ type: 'url', content: url });
    setImportResult(result);
    setCourseName(result.metadata.title || url);
    setCrawlUrl(url);
    setPages([]);
    setSelectedPages(new Set());
    setSourceType('url');
  };

  const saveCourseToConfig = (course: Course) => {
    const maps = course.maps && course.maps.length > 0 ? course.maps : [{ id: 0, title: '地图 1', description: '' }];
    // 将 Course 转为 CourseConfig 便于 ConfigService 管理
    const courseConfig = {
      id: course.id,
      version: '1.0.0',
      metadata: {
        name: course.name,
        icon: course.icon,
        description: course.description || '',
        author: 'User',
        tags: ['custom'],
        difficulty: 'beginner',
        estimatedTime: `${course.levels.length * 2} 分钟`,
        targetAudience: ['Learner'],
      },
      settings: {
        type: 'concept',
        questionModes: ['single_choice', 'true_false', 'fill_blank'],
        difficultyProgression: 'progressive',
        shuffleQuestions: false,
        allowSkip: false,
      },
      maps: maps.map((m, idx) => ({
        id: m.id ?? idx,
        title: m.title,
        description: m.description,
        unlockCondition: (m as any).unlockCondition ?? null,
        bonusXP: (m as any).bonusXP ?? 0,
      })),
      levels: (course.levels as any[]).map((lvl: any) => {
        const mapIndex =
          lvl.mapIndex ??
          maps.findIndex((m) => m.title === lvl.map) ??
          0;
        return {
          id: lvl.id,
          mapIndex: mapIndex < 0 ? 0 : mapIndex,
          title: lvl.title,
          description: lvl.description,
          difficulty: lvl.difficulty || 'easy',
          question: lvl.questions?.[0] || null,
          config: lvl.config || {
            timeLimit: 0,
            maxAttempts: 0,
            showHints: true,
            hintCost: 0,
            xpBase: 100,
            xpBonus: { noHint: 20, fastComplete: 30, firstTry: 50 },
          },
        };
      }),
      createdAt: course.createdAt,
      isCustom: true,
    };
    configService.saveCustomCourse(courseConfig as any);
    return courseConfig;
  };

  const handleGenerate = async () => {
    if (!importResult?.text) return;
    setGenerating(true);
    setStep('generate');
    setErrorMsg('');
    try {
      const selectedList = pages.filter((p) => selectedPages.size === 0 || selectedPages.has(p.url));
      const shouldUsePages = sourceType === 'crawl' && selectedList.length > 0;
      const course = await courseGeneratorService.generateCourse(
        importResult.text,
        courseName,
        config,
        (c, t) => setProgress({ current: c, total: t }),
        shouldUsePages ? selectedList : undefined
      );
      const savedConfig = saveCourseToConfig(course);
      // 保存到 localStorage & configService
      const customCourses = JSON.parse(localStorage.getItem('zlearn_custom_courses') || '[]');
      customCourses.push(savedConfig);
      localStorage.setItem('zlearn_custom_courses', JSON.stringify(customCourses));
      setStep('complete');
      onComplete(course);
    } catch (err) {
      console.error('课程生成失败', err);
      setErrorMsg((err as any)?.message || '课程生成失败，请检查网络/Key/输入内容');
      setStep('configure');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">✨ 创建自定义课程</h2>
          <p className="text-slate-400 mt-1">导入内容，AI 自动生成闯关题目</p>
        </div>

{step === 'import' && (
  <div className="p-6 space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">📄 上传 PDF 文档</label>
      <input
                type="file"
                accept=".pdf,.md,.markdown,.json,.xml,.txt"
                onChange={handleFileUpload}
                className="w-full p-3 bg-slate-700 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">📝 粘贴 Markdown 内容</label>
              <textarea
                rows={4}
                placeholder="在此粘贴 Markdown 文本..."
                onChange={(e) => handleMarkdownPaste(e.target.value)}
                className="w-full p-3 bg-slate-700 rounded-xl resize-none"
              />
            </div>
            <div>
      <label className="block text-sm font-medium mb-2">🌐 输入网页 URL</label>
      <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/docs"
                  className="flex-1 p-3 bg-slate-700 rounded-xl"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleURLFetch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
        <button
          onClick={() => {
            const input = document.querySelector('input[type=\"url\"]') as HTMLInputElement;
            if (input?.value) handleURLFetch(input.value);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
        >
          抓取
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          深度
          <input
            type="number"
            min={1}
            max={4}
            value={crawlDepth}
            onChange={(e) => setCrawlDepth(Number(e.target.value))}
            className="w-16 bg-slate-700 rounded px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2">
          最多链接
          <input
            type="number"
            min={10}
            max={200}
            value={crawlMax}
            onChange={(e) => setCrawlMax(Number(e.target.value))}
            className="w-20 bg-slate-700 rounded px-2 py-1"
          />
        </label>
        <button
          onClick={async () => {
            if (!crawlUrl) return;
            setIsCrawling(true);
            setErrorMsg('');
            try {
              const crawled = await crawlerService.crawl(crawlUrl, { depth: crawlDepth, maxLinks: crawlMax });
              setPages(crawled);
              setSelectedPages(new Set(crawled.map((p) => p.url)));
              setSourceType('crawl');
            } catch (err) {
              console.error(err);
              setErrorMsg((err as any)?.message || '抓取失败');
            } finally {
              setIsCrawling(false);
            }
          }}
          className="col-span-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:bg-slate-600"
          disabled={isCrawling || !crawlUrl}
        >
          {isCrawling ? '正在扫描导航...' : '扫描导航并选择页面'}
        </button>
      </div>
    </div>

    {importResult && (
      <div className="p-4 bg-slate-700/50 rounded-xl">
        <div className="flex items-center gap-2 text-green-400 mb-2">
                  <span>✓</span>
                  <span className="font-medium">{importResult.metadata.title}</span>
                </div>
                <div className="text-sm text-slate-400">
                  约 {importResult.metadata.wordCount} 字 · 预估 {importResult.metadata.estimatedTokens} Token
        </div>
      </div>
    )}

    {pages.length > 0 && (
      <div className="mt-4 p-3 bg-slate-700/40 rounded-xl text-sm text-slate-200 space-y-2">
        <div className="flex justify-between items-center">
          <div>已抓取页面：{pages.length} 个</div>
          <div className="space-x-2">
            <button
              onClick={() => setSelectedPages(new Set(pages.map((p) => p.url)))}
              className="px-2 py-1 bg-slate-600 rounded"
            >
              全选
            </button>
            <button
              onClick={() => setSelectedPages(new Set())}
              className="px-2 py-1 bg-slate-600 rounded"
            >
              全不选
            </button>
            <button
              onClick={() => {
                const selected = pages.filter((p) => selectedPages.has(p.url));
                const text = selected
                  .map((p) => `# ${p.title}\n\n${p.markdown}`)
                  .join('\n\n---\n\n');
                const blob = new Blob([text], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${courseName || 'custom-course'}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-2 py-1 bg-blue-600 rounded"
            >
              导出 Markdown
            </button>
          </div>
        </div>
        <div className="max-h-48 overflow-auto space-y-1">
          {pages.map((p) => (
            <label key={p.url} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedPages.has(p.url)}
                onChange={(e) => {
                  const next = new Set(selectedPages);
                  if (e.target.checked) next.add(p.url);
                  else next.delete(p.url);
                  setSelectedPages(next);
                }}
              />
              <span className="truncate" title={p.url}>
                {p.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    )}

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
    {errorMsg && (
      <div className="p-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-100 text-sm">
        {errorMsg}
      </div>
    )}
  </div>
)}

        {step === 'configure' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">课程名称</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-3 bg-slate-700 rounded-xl"
              />
            </div>
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
            </div>
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">难度分布模式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'uniform', label: '均匀', icon: '⚖️' },
                  { value: 'progressive', label: '递增', icon: '📈' },
                  { value: 'random', label: '随机', icon: '🎲' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConfig({ ...config, difficultyMode: opt.value as any })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      config.difficultyMode === opt.value ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">做题模式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'sequential', label: '顺序', icon: '➡️' },
                  { value: 'random', label: '随机', icon: '🔀' },
                  { value: 'adaptive', label: '自适应', icon: '🧠' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConfig({ ...config, questionMode: opt.value as any })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      config.questionMode === opt.value ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-xl block mb-1">{opt.icon}</span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-xl">
              <h4 className="font-medium mb-2">📊 课程预览</h4>
              <p className="text-sm text-slate-400">
                将生成 <span className="text-white font-bold">{config.mapCount}</span> 张地图，
                共 <span className="text-white font-bold">{config.mapCount * config.levelsPerMap}</span> 个关卡
              </p>
            </div>
           <div className="flex gap-3">
             <button onClick={() => setStep('import')} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl">
               上一步
             </button>
             <button
                onClick={handleGenerate}
                disabled={generating}
               className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold"
             >
               🚀 开始生成
             </button>
           </div>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-100 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {step === 'generate' && (
          <div className="p-6 text-center space-y-6">
            <div className="text-6xl animate-bounce">🤖</div>
            <h3 className="text-xl font-bold">AI 正在生成课程...</h3>
            <p className="text-slate-400">
              正在生成第 {progress.current} / {progress.total || config.mapCount} 张地图
            </p>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: `${(progress.current / Math.max(progress.total || config.mapCount, 1)) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-500">预计需要 {config.mapCount * 3} 秒，请耐心等待</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="p-6 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold">课程创建成功！</h3>
            <p className="text-slate-400">"{courseName}" 已添加到你的课程列表</p>
            <button onClick={onCancel} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">
              开始学习
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCreator;
