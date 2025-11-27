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
  userId: string;
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

const DB_NAME = 'zlearn_db';
const DB_VERSION = 1;

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('events')) {
            const store = db.createObjectStore('events', { keyPath: 'id' });
            store.createIndex('type', 'type');
            store.createIndex('userId', 'userId');
            store.createIndex('timestamp', 'timestamp');
          }
          if (!db.objectStoreNames.contains('progress')) {
            const store = db.createObjectStore('progress', { keyPath: 'id' });
            store.createIndex('courseId', 'courseId');
            store.createIndex('userId', 'userId');
          }
          if (!db.objectStoreNames.contains('sessions')) {
            const store = db.createObjectStore('sessions', { keyPath: 'id' });
            store.createIndex('userId', 'userId');
            store.createIndex('startTime', 'startTime');
          }
          if (!db.objectStoreNames.contains('courses')) {
            db.createObjectStore('courses', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  // ========== helpers ==========
  private async withStore<T>(storeName: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest | void): Promise<any> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = run(store);
      tx.oncomplete = () => resolve(result instanceof IDBRequest ? (result as any).result : result);
      tx.onerror = () => reject(tx.error);
    });
  }

  private uid(prefix: string) {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return `${prefix}_${(crypto as any).randomUUID()}`;
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  // ========== Events ==========
  async addEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<string> {
    const id = this.uid('evt');
    await this.withStore('events', 'readwrite', (store) => store.put({ ...event, id }));
    return id;
  }

  async getEvents(filter?: { type?: string; userId?: string; startTime?: number; endTime?: number }): Promise<AnalyticsEvent[]> {
    const all = (await this.withStore('events', 'readonly', (store) => store.getAll())) as AnalyticsEvent[];
    return all.filter((evt) => {
      if (filter?.type && evt.type !== filter.type) return false;
      if (filter?.userId && evt.userId !== filter.userId) return false;
      if (filter?.startTime && evt.timestamp < filter.startTime) return false;
      if (filter?.endTime && evt.timestamp > filter.endTime) return false;
      return true;
    });
  }

  // ========== Progress ==========
  async saveProgress(progress: UserProgress): Promise<void> {
    await this.withStore('progress', 'readwrite', (store) => store.put(progress));
  }

  async getProgress(userId: string, courseId?: string): Promise<UserProgress[]> {
    const all = (await this.withStore('progress', 'readonly', (store) => store.getAll())) as UserProgress[];
    return all.filter((p) => p.userId === userId && (!courseId || p.courseId === courseId));
  }

  // ========== Sessions ==========
  async startSession(userId: string): Promise<string> {
    const id = this.uid('sess');
    await this.withStore('sessions', 'readwrite', (store) =>
      store.put({
        id,
        userId,
        startTime: Date.now(),
        duration: 0,
        levelsCompleted: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      })
    );
    return id;
  }

  async endSession(sessionId: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const record: LearningSession | undefined = await new Promise((resolve) => {
      const req = store.get(sessionId);
      req.onsuccess = () => resolve(req.result as LearningSession | undefined);
      req.onerror = () => resolve(undefined);
    });
    if (record) {
      record.endTime = Date.now();
      record.duration = (record.endTime || 0) - record.startTime;
      store.put(record);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // ========== Courses ==========
  async saveCourse(course: any): Promise<void> {
    await this.withStore('courses', 'readwrite', (store) => store.put(course));
  }

  async getCourses(): Promise<any[]> {
    return (await this.withStore('courses', 'readonly', (store) => store.getAll())) as any[];
  }

  // ========== Backup ==========
  async exportAllData(): Promise<string> {
    const db = await this.init();
    const gather = async (storeName: string) =>
      new Promise<any[]>((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as any[]);
        req.onerror = () => resolve([]);
      });

    const data = {
      exportedAt: new Date().toISOString(),
      events: await gather('events'),
      progress: await gather('progress'),
      sessions: await gather('sessions'),
      courses: await gather('courses'),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const db = await this.init();
    const runImport = (storeName: string, payload: any[]) =>
      new Promise<void>((resolve) => {
        if (!payload) return resolve();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        payload.forEach((row) => store.put(row));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    await runImport('events', data.events || []);
    await runImport('progress', data.progress || []);
    await runImport('sessions', data.sessions || []);
    await runImport('courses', data.courses || []);
  }

  async cleanOldEvents(daysToKeep = 30): Promise<number> {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const events = await this.getEvents({ endTime: cutoff });
    const db = await this.init();
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    events.forEach((evt) => store.delete(evt.id));
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(events.length);
      tx.onerror = () => resolve(0);
    });
  }
}

export const storageService = new StorageService();
