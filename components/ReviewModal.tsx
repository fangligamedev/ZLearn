import React, { useState } from 'react';
import { X, BarChart3, RefreshCcw, Sparkles } from 'lucide-react';
import { Course } from '../types';

interface HistoryItem {
  levelId: number;
  question: string;
  correct: boolean;
  userAnswer: string | boolean | null;
  map?: string;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  conceptProgress: {
    currentLevel: number;
    levelStars: Record<number, number>;
  };
  history: HistoryItem[];
  onGenerateSummary: () => Promise<string>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, course, conceptProgress, history, onGenerateSummary }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const totalLevels = course?.levels?.length || 0;
  const completed = Object.keys(conceptProgress.levelStars).length;
  const accuracy =
    history.length > 0 ? Math.round((history.filter(h => h.correct).length / history.length) * 100) : 0;
  const mistakes = history.filter(h => !h.correct).slice(-10).reverse();

  const handleGenerate = async () => {
    setLoading(true);
    const text = await onGenerateSummary();
    setSummary(text);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <BarChart3 size={18} /> 复盘面板 {course ? `- ${course.name}` : ''}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white">
              <div className="text-xs text-slate-400">完成关卡</div>
              <div className="text-2xl font-bold">{completed}/{totalLevels}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white">
              <div className="text-xs text-slate-400">已获星数</div>
              <div className="text-2xl font-bold">
                {Object.values(conceptProgress.levelStars).reduce((a, b) => a + b, 0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white">
              <div className="text-xs text-slate-400">正确率</div>
              <div className="text-2xl font-bold">{accuracy}%</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-300 mb-2 font-bold">最近错题</div>
            {mistakes.length === 0 && <div className="text-slate-500 text-sm">暂无错题，继续保持！</div>}
            {mistakes.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-slate-100 mb-2">
                <div className="text-xs text-red-200 mb-1">关卡 #{m.levelId} {m.map ? `(${m.map})` : ''}</div>
                <div className="font-bold mb-1">{m.question}</div>
                <div className="text-xs text-yellow-200">你的答案: {String(m.userAnswer)}</div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm flex items-center gap-2"><Sparkles size={16}/> AI 总结</div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成总结'}
              </button>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-line min-h-[80px]">
              {summary || '点击生成总结，获取学习建议。'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
