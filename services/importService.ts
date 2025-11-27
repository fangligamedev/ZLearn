export interface ImportSource {
  type: 'pdf' | 'markdown' | 'url' | 'plain';
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
  async parsePDF(file: File): Promise<ImportResult> {
    try {
      let pdfjsLib: any = null;
      try {
        pdfjsLib = await import('pdfjs-dist');
      } catch {
        try {
          // @ts-ignore remote module fallback
          pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.mjs');
        } catch (e) {
          pdfjsLib = null;
        }
      }
      if (!pdfjsLib) {
        return {
          success: false,
          text: '',
          metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
          error: '缺少 PDF 解析依赖，无法解析 PDF',
        };
      }

      // @ts-ignore: runtime assignment for worker
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
          title: file.name.replace(/\.pdf$/i, ''),
          wordCount: fullText.split(/\s+/).length,
          estimatedTokens: Math.round(fullText.length / 4),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        text: '',
        metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
        error: error?.message || 'PDF 解析失败',
      };
    }
  }

  parseMarkdown(content: string, name?: string): ImportResult {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : name || '未命名文档';

    const plainText = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>`]/g, '')
      .trim();

    return {
      success: true,
      text: plainText,
      metadata: {
        title,
        wordCount: plainText.split(/\s+/).length,
        estimatedTokens: Math.round(plainText.length / 4),
      },
    };
  }

  async fetchURL(url: string): Promise<ImportResult> {
    try {
      const fetchMarkdown = async (target: string) => {
        const readerUrl = `https://r.jina.ai/${target}`;
        const response = await fetch(readerUrl, { headers: { Accept: 'text/markdown' } });
        if (!response.ok) throw new Error(`抓取失败: ${response.status}`);
        return await response.text();
      };

      const mainMarkdown = await fetchMarkdown(url);

      // 简单提取同域链接，递归抓取一级
      const links = Array.from(mainMarkdown.matchAll(/\[[^\]]+]\((https?:\/\/[^)]+)\)/g))
        .map((m) => m[1])
        .filter((link) => {
          try {
            const u = new URL(link);
            return u.hostname === new URL(url).hostname;
          } catch {
            return false;
          }
        })
        .slice(0, 5); // 限制最多 5 个

      const subPages: string[] = [];
      for (const link of links) {
        try {
          const md = await fetchMarkdown(link);
          subPages.push(md);
        } catch {
          // 忽略失败
        }
      }

      const combined = [mainMarkdown, ...subPages].join('\n\n');
      return this.parseMarkdown(combined, new URL(url).hostname);
    } catch (error: any) {
      return {
        success: false,
        text: '',
        metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
        error: error?.message || '网页抓取失败',
      };
    }
  }

  async import(source: ImportSource): Promise<ImportResult> {
    switch (source.type) {
      case 'pdf':
        return this.parsePDF(source.content as File);
      case 'markdown':
        return this.parseMarkdown(source.content as string, source.name);
      case 'url':
        return this.fetchURL(source.content as string);
      case 'plain': {
        const text = String(source.content || '');
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        return {
          success: true,
          text,
          metadata: {
            title: source.name || '未命名文档',
            wordCount,
            estimatedTokens: Math.round(text.length / 4),
          },
        };
      }
      default:
        return {
          success: false,
          text: '',
          metadata: { title: '', wordCount: 0, estimatedTokens: 0 },
          error: '不支持的导入类型',
        };
    }
  }
}

export const importService = new ImportService();
