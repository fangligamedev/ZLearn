import { configService } from './configService';
import { storageService } from './storageService';
import type { CourseConfig } from '../types/config';

export interface CourseBackupPayload {
  exportedAt: string;
  courses: CourseConfig[];
}

export interface ImportOptions {
  overrideExisting?: boolean;
  mapCourse?: (course: CourseConfig) => CourseConfig;
}

class BackupService {
  exportCourses(courseIds?: string[]): string {
    const all = configService.getAllCourseConfigs();
    const selected = courseIds && courseIds.length > 0 ? all.filter((c) => courseIds.includes(c.id)) : all;
    const payload: CourseBackupPayload = {
      exportedAt: new Date().toISOString(),
      courses: selected,
    };
    return JSON.stringify(payload, null, 2);
  }

  async importCourses(json: string, options: ImportOptions = {}): Promise<{ imported: number; renamed: string[] }> {
    const payload = JSON.parse(json) as CourseBackupPayload;
    const list = payload?.courses || [];
    let count = 0;
    const renamed: string[] = [];
    for (const course of list) {
      const mapped = options.mapCourse ? options.mapCourse(course) : course;
      let newCourse = { ...mapped };
      const exists = configService.getCourseConfig(newCourse.id);
      if (exists && !options.overrideExisting) {
        // 不覆盖则改名
        const suffix = `-import-${Date.now()}`;
        newCourse = {
          ...newCourse,
          id: `${newCourse.id}${suffix}`,
          metadata: {
            ...newCourse.metadata,
            name: `${newCourse.metadata.name} (导入副本)`,
          },
        };
        renamed.push(`${mapped.id} -> ${newCourse.id}`);
      }
      // 注册到运行时，并保存到本地（localStorage & indexedDB）
      configService.saveCustomCourse(newCourse as any);
      await storageService.saveCourse(newCourse);
      count += 1;
    }
    return { imported: count, renamed };
  }
}

export const backupService = new BackupService();
