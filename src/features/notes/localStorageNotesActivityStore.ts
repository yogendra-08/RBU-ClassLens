import type {
  NotesActivityStore,
  NoteViewActivity,
  RecordFirstOpenInput,
  TeacherActivityScope,
} from "./types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const DEFAULT_STORAGE_KEY = "classlens:note-first-opens:v1";

function isActivity(value: unknown): value is NoteViewActivity {
  if (!value || typeof value !== "object") return false;

  const activity = value as Record<string, unknown>;
  return (
    typeof activity.noteId === "string" &&
    typeof activity.classId === "string" &&
    typeof activity.teacherId === "string" &&
    typeof activity.studentId === "string" &&
    typeof activity.studentName === "string" &&
    typeof activity.firstOpenedAt === "string"
  );
}

/**
 * A small local demo adapter. It stores only the first-open event for each
 * student/note pair; it does not measure time spent or reading progress.
 */
export class LocalStorageNotesActivityStore implements NotesActivityStore {
  constructor(
    private readonly storageKey = DEFAULT_STORAGE_KEY,
    private readonly storage?: StorageLike,
  ) {}

  async recordFirstOpen(input: RecordFirstOpenInput): Promise<NoteViewActivity> {
    this.assertIdentity(input);
    const activities = this.readActivities();
    const existing = activities.find(
      (activity) =>
        activity.noteId === input.noteId &&
        activity.studentId === input.studentId,
    );

    if (existing) return existing;

    const activity: NoteViewActivity = {
      ...input,
      firstOpenedAt: new Date().toISOString(),
    };
    activities.push(activity);
    this.writeActivities(activities);
    return activity;
  }

  async listForTeacher(
    scope: TeacherActivityScope,
  ): Promise<NoteViewActivity[]> {
    const allowedClassIds = new Set(scope.classIds);
    return this.readActivities().filter(
      (activity) =>
        activity.teacherId === scope.teacherId &&
        allowedClassIds.has(activity.classId),
    );
  }

  private assertIdentity(input: RecordFirstOpenInput): void {
    if (
      !input.teacherId.trim() ||
      !input.classId.trim() ||
      !input.noteId.trim() ||
      !input.studentId.trim()
    ) {
      throw new Error("A signed-in student and note class context are required.");
    }
  }

  private readActivities(): NoteViewActivity[] {
    const raw = this.getStorage().getItem(this.storageKey);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isActivity)) {
        throw new Error("Saved note view records have an unexpected format.");
      }
      return parsed;
    } catch {
      throw new Error("Saved note view records are unreadable; no viewing status was inferred.");
    }
  }

  private writeActivities(activities: NoteViewActivity[]): void {
    this.getStorage().setItem(this.storageKey, JSON.stringify(activities));
  }

  private getStorage(): StorageLike {
    if (this.storage) return this.storage;
    if (typeof globalThis.localStorage === "undefined") {
      throw new Error("localStorage is unavailable; provide a NotesActivityStore adapter.");
    }
    return globalThis.localStorage;
  }
}

export function createLocalStorageNotesActivityStore(
  storage?: StorageLike,
): LocalStorageNotesActivityStore {
  return new LocalStorageNotesActivityStore(DEFAULT_STORAGE_KEY, storage);
}
