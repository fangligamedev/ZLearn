import { storageService, AnalyticsEvent } from './storageService';

export const EVENTS = {
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  COURSE_SELECT: 'course_select',
  COURSE_CREATE: 'course_create',
  LEVEL_START: 'level_start',
  LEVEL_COMPLETE: 'level_complete',
  LEVEL_FAIL: 'level_fail',
  LEVEL_ABANDON: 'level_abandon',
  ANSWER_SUBMIT: 'answer_submit',
  ANSWER_CORRECT: 'answer_correct',
  ANSWER_WRONG: 'answer_wrong',
  HINT_REQUEST: 'hint_request',
  COACH_CHAT: 'coach_chat',
  COACH_TTS: 'coach_tts',
  REVIEW_OPEN: 'review_open',
  REVIEW_AI_SUMMARY: 'review_ai_summary',
} as const;

class AnalyticsService {
  private userId = '';
  private sessionId = '';
  private eventQueue: Omit<AnalyticsEvent, 'id'>[] = [];
  private flushTimer: number | null = null;

  private uid(prefix: string) {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return `${prefix}_${(crypto as any).randomUUID()}`;
    }
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  async init(userId: string) {
    await storageService.init();
    this.userId = userId;
    this.sessionId = await storageService.startSession(userId);
    this.track(EVENTS.SESSION_START, {});
    this.flushTimer = window.setInterval(() => this.flush(), 10000);
    window.addEventListener('beforeunload', () => {
      this.track(EVENTS.SESSION_END, {});
      this.flush();
      storageService.endSession(this.sessionId);
    });
  }

  async destroy() {
    if (this.flushTimer) window.clearInterval(this.flushTimer);
    this.track(EVENTS.SESSION_END, {});
    await storageService.endSession(this.sessionId);
    await this.flush();
  }

  track(type: string, data: Record<string, any>) {
    if (!this.userId) return;
    this.eventQueue.push({
      type,
      userId: this.userId,
      sessionId: this.sessionId || this.uid('sess'),
      timestamp: Date.now(),
      data,
    });
    if ([EVENTS.LEVEL_COMPLETE, EVENTS.SESSION_END].includes(type as any)) {
      this.flush();
    }
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;
    const events = [...this.eventQueue];
    this.eventQueue = [];
    for (const evt of events) {
      await storageService.addEvent(evt);
    }
  }

  // Convenience helpers
  trackPageView(page: string) {
    this.track(EVENTS.PAGE_VIEW, { page });
  }

  trackCourseSelect(courseId: string) {
    this.track(EVENTS.COURSE_SELECT, { courseId });
  }

  trackCourseCreate(courseId: string) {
    this.track(EVENTS.COURSE_CREATE, { courseId });
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
      attemptNumber,
    });
  }
}

export const analyticsService = new AnalyticsService();
