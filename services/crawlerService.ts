export interface CrawlOptions {
  depth?: number;
  maxLinks?: number;
}

export interface CrawledPage {
  url: string;
  title: string;
  markdown: string;
}

const fetchMarkdown = async (target: string): Promise<string> => {
  const readerUrl = `https://r.jina.ai/${target}`;
  const res = await fetch(readerUrl, { headers: { Accept: 'text/markdown' } });
  if (!res.ok) throw new Error(`抓取失败 ${res.status}`);
  return await res.text();
};

const isDocLink = (url: string) => {
  try {
    const u = new URL(url);
    // 仅同域，且后缀为空或常见文档页
    const ext = (u.pathname.split('.').pop() || '').toLowerCase();
    const allowed = ['', 'html', 'htm', 'md', 'markdown'];
    return allowed.includes(ext);
  } catch {
    return false;
  }
};

const extractLinks = (markdown: string, baseUrl: URL, max: number): string[] => {
  const links = Array.from(markdown.matchAll(/\[[^\]]+]\((https?:\/\/[^)]+)\)/g))
    .map((m) => m[1])
    .filter((u) => {
      try {
        const parsed = new URL(u);
        return parsed.hostname === baseUrl.hostname && isDocLink(u);
      } catch {
        return false;
      }
    });
  // 去重 & 限制数量
  const uniq: string[] = [];
  for (const l of links) {
    if (!uniq.includes(l)) {
      uniq.push(l);
    }
    if (uniq.length >= max) break;
  }
  return uniq;
};

export class CrawlerService {
  async crawl(startUrl: string, options: CrawlOptions = {}): Promise<CrawledPage[]> {
    const depth = options.depth ?? 2;
    const maxLinks = options.maxLinks ?? 50;
    const base = new URL(startUrl);

    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
    const visited = new Set<string>();
    const pages: CrawledPage[] = [];

    while (queue.length > 0 && pages.length < maxLinks) {
      const { url, depth: d } = queue.shift()!;
      if (visited.has(url) || d > depth) continue;
      visited.add(url);

      try {
        const md = await fetchMarkdown(url);
        const titleMatch = md.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : new URL(url).pathname;
        pages.push({ url, title, markdown: md });

        if (d < depth) {
          const links = extractLinks(md, base, maxLinks - pages.length);
          links.forEach((link) => queue.push({ url: link, depth: d + 1 }));
        }
      } catch (err) {
        console.warn('crawl failed', url, err);
      }
    }

    return pages;
  }
}

export const crawlerService = new CrawlerService();
