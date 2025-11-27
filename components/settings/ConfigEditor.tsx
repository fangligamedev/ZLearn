import React, { useState } from 'react';
import { configService } from '../../services/configService';

interface ConfigEditorProps {
  onClose: () => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ onClose }) => {
  const [starRules, setStarRules] = useState({
    firstAttempt: configService.get<number>('scoring.starRules.firstAttempt') || 3,
    secondAttempt: configService.get<number>('scoring.starRules.secondAttempt') || 2,
    thirdOrMore: configService.get<number>('scoring.starRules.thirdOrMore') || 1,
  });
  const [autoAdvance, setAutoAdvance] = useState(configService.get<boolean>('progression.autoAdvance') ?? true);
  const [autoReadQuestion, setAutoReadQuestion] = useState(
    configService.get<boolean>('coach.autoReadQuestion') ?? true
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">⚙️ 游戏配置</h2>
          <p className="text-sm text-slate-400 mt-1">调整游戏参数 (修改后立即生效)</p>
        </div>

        <div className="p-6 space-y-6">
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
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
            取消
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg">
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
