import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';
import { backupService } from '../../services/backupService';
import { configService } from '../../services/configService';
import type { CourseConfig } from '../../types/config';

const DataBackup: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [courses, setCourses] = useState<CourseConfig[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const list = configService.getAllCourseConfigs();
    setCourses(list);
    setSelectedIds(new Set(list.map((c) => c.id)));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await storageService.init();
      const data = await storageService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zlearn_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败', err);
    } finally {
      setExporting(false);
    }
  };

  const handleCourseExport = () => {
    try {
      const ids = Array.from(selectedIds);
      const names = courses
        .filter((c) => selectedIds.has(c.id))
        .map((c) => c.id)
        .join('_');
      const suffix = names ? `_${names}` : '';
      const data = backupService.exportCourses(ids);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zlearn_courses_${new Date().toISOString().slice(0, 10)}${suffix}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出课程失败', err);
      alert('导出课程失败，请重试');
    }
  };

  const handleCourseImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const { imported, renamed } = await backupService.importCourses(text);
      const renameMsg = renamed.length ? `\n以下已自动改名避免覆盖:\n${renamed.join('\n')}` : '';
      alert(`导入完成，重建课程 ${imported} 个${renameMsg}`);
      const list = configService.getAllCourseConfigs();
      setCourses(list);
      setSelectedIds(new Set(list.map((c) => c.id)));
    } catch (err) {
      console.error('导入课程失败', err);
      alert('导入课程失败，请检查文件格式');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      await storageService.init();
      await storageService.importData(text);
      alert('数据恢复成功！');
    } catch (err) {
      console.error('导入失败', err);
      alert('导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-xl space-y-6 w-full">
      <h3 className="text-xl font-bold">💾 数据备份</h3>
      <div>
        <h4 className="font-medium mb-2">导出数据</h4>
        <p className="text-sm text-slate-400 mb-3">将学习进度、课程数据、分析数据导出为 JSON 文件</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-lg"
        >
          {exporting ? '导出中...' : '📥 导出备份'}
        </button>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <h4 className="font-medium mb-2">课程关卡导出 / 导入</h4>
        <p className="text-sm text-slate-400 mb-3">选择要导出的课程页签（包含地图、关卡、题干），导入可完整重建关卡。</p>
        <div className="max-h-40 overflow-auto bg-slate-700/40 rounded-lg p-3 space-y-2 text-sm">
          {courses.map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.has(c.id)}
                onChange={(e) => {
                  const next = new Set(selectedIds);
                  if (e.target.checked) next.add(c.id);
                  else next.delete(c.id);
                  setSelectedIds(next);
                }}
              />
              <span className="truncate" title={c.metadata.name}>
                {c.metadata.name} ({c.id})
              </span>
            </label>
          ))}
          {courses.length === 0 && <div className="text-slate-400">暂无课程</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setSelectedIds(new Set(courses.map((c) => c.id)));
            }}
            className="px-3 py-2 bg-slate-700 rounded-lg"
          >
            全选
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-2 bg-slate-700 rounded-lg"
          >
            全不选
          </button>
          <button
            onClick={handleCourseExport}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 rounded-lg"
          >
            导出所选课程
          </button>
          <label className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer">
            {importing ? '导入中...' : '导入课程'}
            <input type="file" accept=".json" onChange={handleCourseImport} className="hidden" />
          </label>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">恢复数据</h4>
        <p className="text-sm text-slate-400 mb-3">从之前导出的 JSON 文件恢复数据</p>
        <label className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer">
          {importing ? '导入中...' : '📤 选择备份文件'}
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>
      <div className="p-4 bg-slate-700/50 rounded-xl">
        <h4 className="font-medium mb-2">☁️ Zeabur 云存储 (可选)</h4>
        <p className="text-sm text-slate-400 mb-2">可将备份文件上传到 Zeabur Object Storage 实现云端备份：</p>
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
