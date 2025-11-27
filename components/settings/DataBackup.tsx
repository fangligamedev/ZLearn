import React, { useState } from 'react';
import { storageService } from '../../services/storageService';

const DataBackup: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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
