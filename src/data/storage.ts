import { createSeedSnapshot } from "./seed";
import type { DataSnapshot } from "./models";

export const STORAGE_KEY = "rbu-classlens.demo.v1";

export interface SnapshotStorage {
  load(): DataSnapshot;
  save(snapshot: DataSnapshot): void;
  clear(): void;
}

export class LocalStorageSnapshotStore implements SnapshotStorage {
  constructor(
    private readonly storage: Storage | undefined = getLocalStorage(),
    readonly key = STORAGE_KEY,
  ) {}

  load(): DataSnapshot {
    if (!this.storage) {
      return createSeedSnapshot();
    }

    const serialized = this.storage.getItem(this.key);
    if (!serialized) {
      const seed = createSeedSnapshot();
      this.save(seed);
      return seed;
    }

    try {
      const parsed: unknown = JSON.parse(serialized);
      if (isDataSnapshot(parsed)) {
        return parsed;
      }
    } catch {
      // Restore from the seed if the browser value was manually edited or corrupted.
    }

    const seed = createSeedSnapshot();
    this.save(seed);
    return seed;
  }

  save(snapshot: DataSnapshot): void {
    this.storage?.setItem(this.key, JSON.stringify(snapshot));
  }

  clear(): void {
    this.storage?.removeItem(this.key);
  }
}

function getLocalStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function isDataSnapshot(value: unknown): value is DataSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DataSnapshot>;
  return (
    candidate.schemaVersion === 1 &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.classes) &&
    Array.isArray(candidate.memberships) &&
    Array.isArray(candidate.announcements) &&
    (candidate.announcementComments === undefined ||
      Array.isArray(candidate.announcementComments)) &&
    (candidate.classQuestions === undefined ||
      Array.isArray(candidate.classQuestions)) &&
    Array.isArray(candidate.assignments) &&
    Array.isArray(candidate.quizzes) &&
    Array.isArray(candidate.quizAttempts) &&
    Array.isArray(candidate.questions) &&
    Array.isArray(candidate.materials) &&
    Array.isArray(candidate.submissions) &&
    Array.isArray(candidate.grades) &&
    Array.isArray(candidate.feedback) &&
    Array.isArray(candidate.notes) &&
    (candidate.session === null || typeof candidate.session === "object")
  );
}
