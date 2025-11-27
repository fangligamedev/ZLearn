import { storageService, AnalyticsEvent } from './storageService';
import { EVENTS } from './analyticsService';

export interface RetentionData {
  d1: number;
  d7: number;
  d30: number;
}

export interface LearningHabits {
  preferredHours: number[];
  avgSessionDuration: number;
  avgLevelsPerSession: number;
  weeklyFrequency: number;
}

export interface BottleneckAnalysis {
  levelId: number;
  courseId: string;
  failRate: number;
  avgAttempts: number;
  abandonRate: number;
}

class AnalysisService {
  async calculateRetention(userId: string): Promise<RetentionData> {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const sessions = await storageService.getEvents({ userId, type: EVENTS.SESSION_START });
    if (!sessions.length) return { d1: 0, d7: 0, d30: 0 };

    const first = Math.min(...sessions.map((s) => s.timestamp));
    const daysSince = Math.floor((now - first) / dayMs);

    const hasActivityAfter = (days: number) => {
      const target = first + days * dayMs;
      return sessions.some((s) => s.timestamp >= target && s.timestamp < target + dayMs);
    };

    return {
      d1: daysSince >= 1 && hasActivityAfter(1) ? 100 : 0,
      d7: daysSince >= 7 && hasActivityAfter(7) ? 100 : 0,
      d30: daysSince >= 30 && hasActivityAfter(30) ? 100 : 0,
    };
  }

  async analyzeLearningHabits(userId: string): Promise<LearningHabits> {
    const events = await storageService.getEvents({ userId });
    const hours = new Array(24).fill(0);
    events.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      hours[hour] += 1;
    });

    const preferredHours = hours
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((h) => h.hour);

    const sessions = events.filter((e) => e.type === EVENTS.SESSION_START);
    const sessionEnds = events.filter((e) => e.type === EVENTS.SESSION_END);
    let totalDuration = 0;
    sessions.forEach((start) => {
      const end = sessionEnds.find((e) => e.sessionId === start.sessionId && e.timestamp > start.timestamp);
      if (end) totalDuration += end.timestamp - start.timestamp;
    });

    const avgSessionDuration = sessions.length ? Math.round(totalDuration / sessions.length / 60000) : 0;
    const completions = events.filter((e) => e.type === EVENTS.LEVEL_COMPLETE);
    const avgLevelsPerSession = sessions.length ? Math.round((completions.length / sessions.length) * 10) / 10 : 0;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekSessions = sessions.filter((s) => s.timestamp >= oneWeekAgo);
    const uniqueDays = new Set(weekSessions.map((s) => new Date(s.timestamp).toDateString())).size;

    return {
      preferredHours,
      avgSessionDuration,
      avgLevelsPerSession,
      weeklyFrequency: uniqueDays,
    };
  }

  async analyzeBottlenecks(userId?: string): Promise<BottleneckAnalysis[]> {
    const filter = userId ? { userId } : undefined;
    const events = await storageService.getEvents(filter);
    const levelStats: Map<
      string,
      { starts: number; completes: number; fails: number; abandons: number; totalAttempts: number }
    > = new Map();

    events.forEach((e) => {
      if (
        ![EVENTS.LEVEL_START, EVENTS.LEVEL_COMPLETE, EVENTS.LEVEL_FAIL, EVENTS.LEVEL_ABANDON].includes(e.type as any)
      ) {
        return;
      }
      const key = `${e.data.courseId}-${e.data.levelId}`;
      const stats =
        levelStats.get(key) || { starts: 0, completes: 0, fails: 0, abandons: 0, totalAttempts: 0 };
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

    return Array.from(levelStats.entries())
      .map(([key, stats]) => {
        const [courseId, levelId] = key.split('-');
        return {
          levelId: Number(levelId),
          courseId,
          failRate: stats.starts ? Math.round((stats.fails / stats.starts) * 100) : 0,
          avgAttempts: stats.completes ? Math.round((stats.totalAttempts / stats.completes) * 10) / 10 : 0,
          abandonRate: stats.starts ? Math.round((stats.abandons / stats.starts) * 100) : 0,
        };
      })
      .filter((a) => a.failRate > 30 || a.abandonRate > 20)
      .sort((a, b) => b.failRate - a.failRate);
  }

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
- 偏好学习时段: ${habits.preferredHours.map((h) => `${h}:00`).join(', ')}
- 平均每次学习时长: ${habits.avgSessionDuration} 分钟
- 平均每次完成关卡: ${habits.avgLevelsPerSession} 个
- 本周学习天数: ${habits.weeklyFrequency} 天

### 需关注的关卡
${bottlenecks
  .slice(0, 5)
  .map((b) => `- ${b.courseId} Level ${b.levelId}: 失败率 ${b.failRate}%, 放弃率 ${b.abandonRate}%`)
  .join('\\n')}
    `.trim();
  }
}

export const analysisService = new AnalysisService();
