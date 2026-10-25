export type ClassroomRole = "teacher" | "student";
export type ClassroomTab = "stream" | "classwork" | "people" | "grades" | "settings";
export type ClassworkType = "assignment" | "quiz" | "question" | "material";
export type SubmissionStatus = "assigned" | "turned-in" | "returned" | "missing";

export interface ClassroomPerson {
  id: string;
  name: string;
  email?: string;
  role: ClassroomRole;
  initials?: string;
}

export interface Announcement {
  id: string;
  classId: string;
  author: ClassroomPerson;
  body: string;
  createdAt: string;
  comments?: number;
  commentEntries?: AnnouncementComment[];
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  author: ClassroomPerson;
  body: string;
  createdAt: string;
}

export interface ClassworkItem {
  id: string;
  classId: string;
  type: ClassworkType;
  title: string;
  instructions: string;
  topic?: string;
  dueAt?: string;
  points?: number;
  createdAt: string;
  author: ClassroomPerson;
  attachmentName?: string;
  attachmentSource?: string;
}

export interface StudentSubmission {
  itemId: string;
  studentId: string;
  status: SubmissionStatus;
  turnedInAt?: string;
  grade?: number;
  feedback?: string;
  response?: string;
  attachmentName?: string;
  attachmentSource?: string;
}

export interface Classroom {
  id: string;
  name: string;
  section: string;
  subject: string;
  room: string;
  code: string;
  description: string;
  color: string;
  teacher: ClassroomPerson;
  students: ClassroomPerson[];
  announcements: Announcement[];
  classwork: ClassworkItem[];
  submissions: StudentSubmission[];
  notificationsEnabled?: boolean;
}

export interface ClassroomNotification {
  id: string;
  classId: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
}

export interface ClassroomMutationHandlers {
  onAnnouncementCreate?: (announcement: Announcement) => void;
  onAnnouncementComment?: (comment: AnnouncementComment) => void;
  onClassworkCreate?: (item: ClassworkItem) => void;
  onSubmissionUpdate?: (submission: StudentSubmission) => void;
  onGradeUpdate?: (submission: StudentSubmission) => void;
  onClassUpdate?: (classroom: Classroom) => void;
  onNotificationRead?: (notificationId: string) => void;
  onUserChange?: (user: ClassroomPerson) => void;
  onHome?: () => void;
}

export interface ClassroomAppProps extends ClassroomMutationHandlers {
  /** Seed data copied into the feature's in-memory view when it mounts. */
  classes?: Classroom[];
  /** Defaults to the included demo student only in demo mode. */
  currentUser?: ClassroomPerson;
  /** Seed notifications copied into the feature's in-memory view when it mounts. */
  notifications?: ClassroomNotification[];
  /** Shows a clear local-demo indicator. All edits remain in component memory only. */
  demoMode?: boolean;
  initialClassId?: string;
  initialTab?: ClassroomTab;
  onMutationError?: (error: Error) => void;
  onClassSelect?: (classroom: Classroom) => void;
}
