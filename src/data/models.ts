export type EntityId = string;
export type ISODateTime = string;

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: EntityId;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type MembershipStatus = "active" | "invited" | "removed";

export interface ClassRoom {
  id: EntityId;
  name: string;
  courseCode: string;
  section: string;
  description: string;
  teacherId: EntityId;
  classCode?: string;
  createdAt: ISODateTime;
  archivedAt?: ISODateTime;
}

export interface ClassMembership {
  id: EntityId;
  classId: EntityId;
  userId: EntityId;
  role: Exclude<UserRole, "admin">;
  status: MembershipStatus;
  joinedAt: ISODateTime;
}

export interface Announcement {
  id: EntityId;
  classId: EntityId;
  authorId: EntityId;
  title: string;
  body: string;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  pinned: boolean;
}

export interface AnnouncementComment {
  id: EntityId;
  announcementId: EntityId;
  classId: EntityId;
  authorId: EntityId;
  body: string;
  createdAt: ISODateTime;
}

export interface ClassQuestion {
  id: EntityId;
  classId: EntityId;
  authorId: EntityId;
  prompt: string;
  points: number;
  dueAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface Assignment {
  id: EntityId;
  classId: EntityId;
  authorId: EntityId;
  title: string;
  instructions: string;
  pointsPossible: number;
  dueAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  status: "draft" | "published" | "closed";
}

export interface Quiz {
  id: EntityId;
  classId: EntityId;
  authorId: EntityId;
  title: string;
  instructions: string;
  pointsPossible: number;
  dueAt?: ISODateTime;
  createdAt: ISODateTime;
  status: "draft" | "published" | "closed";
  questionIds: EntityId[];
}

export interface QuizAttempt {
  id: EntityId;
  quizId: EntityId;
  studentId: EntityId;
  answers: Record<EntityId, string | number>;
  status: "draft" | "submitted";
  startedAt: ISODateTime;
  submittedAt?: ISODateTime;
}

export type QuizQuestion =
  | {
      id: EntityId;
      quizId: EntityId;
      type: "multiple-choice";
      prompt: string;
      points: number;
      options: string[];
      correctOptionIndex: number;
    }
  | {
      id: EntityId;
      quizId: EntityId;
      type: "short-answer";
      prompt: string;
      points: number;
      expectedAnswer?: string;
    };

export type NewQuizQuestion =
  | (Omit<
      Extract<QuizQuestion, { type: "multiple-choice" }>,
      "id" | "quizId"
    > & { id?: EntityId })
  | (Omit<
      Extract<QuizQuestion, { type: "short-answer" }>,
      "id" | "quizId"
    > & { id?: EntityId });

export type MaterialKind = "document" | "video" | "link" | "image" | "other";

export interface Material {
  id: EntityId;
  classId: EntityId;
  authorId: EntityId;
  title: string;
  description?: string;
  kind: MaterialKind;
  /** A display filename or a URL; local demo materials do not imply that a file was opened. */
  source: string;
  fileName?: string;
  createdAt: ISODateTime;
}

export type SubmissionStatus = "draft" | "submitted" | "returned";

export interface Submission {
  id: EntityId;
  assignmentId: EntityId;
  studentId: EntityId;
  text?: string;
  attachmentSources: string[];
  status: SubmissionStatus;
  submittedAt?: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Grade {
  id: EntityId;
  submissionId: EntityId;
  graderId: EntityId;
  pointsEarned: number;
  pointsPossible: number;
  gradedAt: ISODateTime;
}

export interface Feedback {
  id: EntityId;
  submissionId: EntityId;
  authorId: EntityId;
  body: string;
  createdAt: ISODateTime;
}

export interface Note {
  id: EntityId;
  userId: EntityId;
  classId?: EntityId;
  title: string;
  body: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DemoSession {
  userId: EntityId;
  startedAt: ISODateTime;
  mode: "demo";
}

export interface DataSnapshot {
  schemaVersion: number;
  users: User[];
  classes: ClassRoom[];
  memberships: ClassMembership[];
  announcements: Announcement[];
  announcementComments?: AnnouncementComment[];
  classQuestions?: ClassQuestion[];
  assignments: Assignment[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  questions: QuizQuestion[];
  materials: Material[];
  submissions: Submission[];
  grades: Grade[];
  feedback: Feedback[];
  notes: Note[];
  session: DemoSession | null;
}

export type NewEntity<
  T extends { id: EntityId },
  Optional extends keyof T = never,
> = Omit<T, "id" | Optional> & Partial<Pick<T, "id" | Optional>>;

export interface CreateSubmissionInput {
  assignmentId: EntityId;
  text?: string;
  attachmentSources?: string[];
  status?: "draft" | "submitted";
}

export interface CreateQuizAttemptInput {
  quizId: EntityId;
  answers: Record<EntityId, string | number>;
  status?: "draft" | "submitted";
}

export interface GradeSubmissionInput {
  pointsEarned: number;
  pointsPossible: number;
}

export interface ReturnSubmissionInput {
  grade?: GradeSubmissionInput;
  feedback?: string;
}

export type CreateClassroomInput = Pick<
  ClassRoom,
  "name" | "courseCode" | "section" | "description"
>;
