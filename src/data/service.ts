import { createSeedSnapshot } from "./seed";
import {
  isDataSnapshot,
  LocalStorageSnapshotStore,
  type SnapshotStorage,
} from "./storage";
import type {
  Announcement,
  AnnouncementComment,
  ClassMembership,
  ClassQuestion,
  ClassRoom,
  CreateClassroomInput,
  CreateQuizAttemptInput,
  CreateSubmissionInput,
  DataSnapshot,
  DemoSession,
  EntityId,
  Feedback,
  Grade,
  GradeSubmissionInput,
  Material,
  NewEntity,
  NewQuizQuestion,
  Note,
  Quiz,
  ReturnSubmissionInput,
  Submission,
  User,
  UserRole,
} from "./models";

export class DataAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAccessError";
  }
}

export interface ClassLensDataService {
  getSnapshot(): DataSnapshot;
  subscribe(listener: (snapshot: DataSnapshot) => void): () => void;
  /** Switches to a seeded sample identity; this is not real authentication. */
  signInAsDemoUser(userId: EntityId): DemoSession;
  signOut(): void;
  resetDemoData(): DataSnapshot;
  getCurrentUser(): User | undefined;
  getClassesForUser(userId?: EntityId): ClassRoom[];
  getClassMembers(classId: EntityId): ClassMembership[];
  createClassroom(input: CreateClassroomInput): ClassRoom;
  joinClassByCode(code: string): ClassRoom;
  addAnnouncementComment(
    announcementId: EntityId,
    body: string,
  ): AnnouncementComment;
  createClassQuestion(
    input: NewEntity<ClassQuestion, "authorId" | "createdAt">,
  ): ClassQuestion;
  createAnnouncement(
    input: NewEntity<
      Announcement,
      "authorId" | "createdAt" | "pinned"
    >,
  ): Announcement;
  createAssignment(
    input: NewEntity<
      DataSnapshot["assignments"][number],
      "authorId" | "createdAt" | "status"
    >,
  ): DataSnapshot["assignments"][number];
  createQuiz(
    input: NewEntity<
      Quiz,
      "authorId" | "createdAt" | "status" | "questionIds"
    >,
    questions: NewQuizQuestion[],
  ): Quiz;
  createMaterial(
    input: NewEntity<Material, "authorId" | "createdAt">,
  ): Material;
  submitAssignment(input: CreateSubmissionInput): Submission;
  createQuizAttempt(input: CreateQuizAttemptInput): DataSnapshot["quizAttempts"][number];
  gradeSubmission(
    submissionId: EntityId,
    input: GradeSubmissionInput,
  ): Grade;
  returnSubmission(submissionId: EntityId, input: ReturnSubmissionInput): void;
  addFeedback(submissionId: EntityId, body: string): Feedback;
  saveNote(
    input: NewEntity<Note, "userId" | "createdAt" | "updatedAt">,
  ): Note;
  deleteNote(noteId: EntityId): void;
}

const TEACHING_ROLES: readonly UserRole[] = ["admin", "teacher"];

export const DEMO_MODE_NOTICE =
  "Demo authentication only: roles and records are stored in this browser and are not secure or connected to a real account.";

/**
 * Local demo service with convenient role checks for the UI.
 * These checks are not a security boundary; all data lives in the user's browser.
 */
export class LocalFirstClassLensService implements ClassLensDataService {
  private snapshot: DataSnapshot;
  private readonly listeners = new Set<(snapshot: DataSnapshot) => void>();
  private readonly onStorage = (event: StorageEvent) => {
    if (event.key === this.storeKey && event.newValue) {
      try {
        const next: unknown = JSON.parse(event.newValue);
        if (isDataSnapshot(next)) {
          this.snapshot = next;
          this.emit();
        }
      } catch {
        // Ignore invalid cross-tab updates and keep the last valid in-memory state.
      }
    }
  };

  private readonly storeKey: string;

  constructor(private readonly store: SnapshotStorage = new LocalStorageSnapshotStore()) {
    this.snapshot = store.load();
    this.storeKey = store instanceof LocalStorageSnapshotStore
      ? store.key
      : "rbu-classlens.demo.v1";
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.onStorage);
    }
  }

  getSnapshot(): DataSnapshot {
    return structuredClone(this.snapshot);
  }

  subscribe(listener: (snapshot: DataSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  signInAsDemoUser(userId: EntityId): DemoSession {
    const user = this.snapshot.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new DataAccessError("That demo user does not exist.");
    }

    const session: DemoSession = {
      userId: user.id,
      startedAt: new Date().toISOString(),
      mode: "demo",
    };
    this.update((draft) => {
      draft.session = session;
    });
    return session;
  }

  signOut(): void {
    this.update((draft) => {
      draft.session = null;
    });
  }

  resetDemoData(): DataSnapshot {
    this.snapshot = createSeedSnapshot();
    this.persistAndEmit();
    return this.getSnapshot();
  }

  getCurrentUser(): User | undefined {
    const userId = this.snapshot.session?.userId;
    return userId
      ? this.snapshot.users.find((candidate) => candidate.id === userId)
      : undefined;
  }

  getClassesForUser(userId = this.requireUser().id): ClassRoom[] {
    const actor = this.requireUser();
    if (userId !== actor.id && actor.role !== "admin") {
      throw new DataAccessError("You may only view your own class memberships.");
    }
    if (actor.role === "admin") {
      return this.getSnapshot().classes;
    }

    const activeClassIds = new Set(
      this.snapshot.memberships
        .filter(
          (membership) =>
            membership.userId === userId && membership.status === "active",
        )
        .map((membership) => membership.classId),
    );
    return this.getSnapshot().classes.filter((classRoom) =>
      activeClassIds.has(classRoom.id),
    );
  }

  getClassMembers(classId: EntityId): ClassMembership[] {
    this.requireClassAccess(classId);
    return this.getSnapshot().memberships.filter(
      (membership) =>
        membership.classId === classId && membership.status === "active",
    );
  }

  createClassroom(input: CreateClassroomInput): ClassRoom {
    const actor = this.requireRole(["teacher"]);
    const name = input.name.trim();
    const courseCode = input.courseCode.trim();
    const section = input.section.trim();
    if (!name || !courseCode || !section) {
      throw new DataAccessError("Class name, course code, and section are required.");
    }

    let classCode = "";
    do {
      classCode = `${courseCode.replace(/[^a-z0-9]/gi, "").slice(0, 4)}${Math.random()
        .toString(36)
        .slice(2, 6)}`.toUpperCase();
    } while (this.snapshot.classes.some((classRoom) => classRoom.classCode === classCode));

    const timestamp = new Date().toISOString();
    const classRoom: ClassRoom = {
      id: this.createId("class"),
      name,
      courseCode,
      section,
      description: input.description.trim(),
      teacherId: actor.id,
      classCode,
      createdAt: timestamp,
    };
    const membership: ClassMembership = {
      id: this.createId("membership"),
      classId: classRoom.id,
      userId: actor.id,
      role: "teacher",
      status: "active",
      joinedAt: timestamp,
    };
    this.update((draft) => {
      draft.classes.unshift(classRoom);
      draft.memberships.unshift(membership);
    });
    return classRoom;
  }

  joinClassByCode(code: string): ClassRoom {
    const student = this.requireRole(["student"]);
    const classRoom = this.snapshot.classes.find(
      (candidate) => candidate.classCode?.toLowerCase() === code.trim().toLowerCase(),
    );
    if (!classRoom) {
      throw new DataAccessError("No class matches that class code.");
    }
    const existing = this.snapshot.memberships.find(
      (membership) =>
        membership.classId === classRoom.id && membership.userId === student.id,
    );
    if (existing?.status === "active") {
      throw new DataAccessError("You are already a member of this class.");
    }

    const membership: ClassMembership = {
      id: existing?.id ?? this.createId("membership"),
      classId: classRoom.id,
      userId: student.id,
      role: "student",
      status: "active",
      joinedAt: new Date().toISOString(),
    };
    this.update((draft) => {
      draft.memberships = draft.memberships.filter(
        (item) => item.id !== membership.id,
      );
      draft.memberships.unshift(membership);
    });
    return classRoom;
  }

  addAnnouncementComment(
    announcementId: EntityId,
    body: string,
  ): AnnouncementComment {
    const announcement = this.snapshot.announcements.find(
      (item) => item.id === announcementId,
    );
    if (!announcement) {
      throw new DataAccessError("That announcement does not exist.");
    }
    const author = this.requireUser();
    this.requireClassAccess(announcement.classId);
    const comment: AnnouncementComment = {
      id: this.createId("comment"),
      announcementId,
      classId: announcement.classId,
      authorId: author.id,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    if (!comment.body) {
      throw new DataAccessError("A comment cannot be empty.");
    }
    this.update((draft) => {
      draft.announcementComments = [
        comment,
        ...(draft.announcementComments ?? []),
      ];
    });
    return comment;
  }

  createClassQuestion(
    input: NewEntity<ClassQuestion, "authorId" | "createdAt">,
  ): ClassQuestion {
    const author = this.requireClassRole(input.classId, TEACHING_ROLES);
    if (!input.prompt.trim() || input.points < 0) {
      throw new DataAccessError("A question prompt and non-negative points are required.");
    }
    const question: ClassQuestion = {
      ...input,
      prompt: input.prompt.trim(),
      id: this.createId("class-question"),
      authorId: author.id,
      createdAt: new Date().toISOString(),
    };
    this.update((draft) => {
      draft.classQuestions = [question, ...(draft.classQuestions ?? [])];
      draft.assignments.unshift({
        id: question.id,
        classId: question.classId,
        authorId: author.id,
        title: question.prompt,
        instructions: question.prompt,
        pointsPossible: Math.max(1, question.points),
        dueAt: question.dueAt,
        createdAt: question.createdAt,
        status: "published",
      });
    });
    return question;
  }

  createAnnouncement(
    input: NewEntity<
      Announcement,
      "authorId" | "createdAt" | "pinned"
    >,
  ): Announcement {
    const actor = this.requireClassRole(input.classId, TEACHING_ROLES);
    const announcement: Announcement = {
      ...input,
      id: input.id ?? this.createId("announcement"),
      authorId: actor.id,
      createdAt: input.createdAt ?? new Date().toISOString(),
      pinned: input.pinned ?? false,
    };
    this.update((draft) => {
      draft.announcements.unshift(announcement);
    });
    return announcement;
  }

  createAssignment(
    input: NewEntity<
      DataSnapshot["assignments"][number],
      "authorId" | "createdAt" | "status"
    >,
  ): DataSnapshot["assignments"][number] {
    const actor = this.requireClassRole(input.classId, TEACHING_ROLES);
    const assignment: DataSnapshot["assignments"][number] = {
      ...input,
      id: input.id ?? this.createId("assignment"),
      authorId: actor.id,
      createdAt: input.createdAt ?? new Date().toISOString(),
      status: input.status ?? "draft",
    };
    this.update((draft) => {
      draft.assignments.unshift(assignment);
    });
    return assignment;
  }

  createQuiz(
    input: NewEntity<
      Quiz,
      "authorId" | "createdAt" | "status" | "questionIds"
    >,
    questionInputs: NewQuizQuestion[],
  ): Quiz {
    const actor = this.requireClassRole(input.classId, TEACHING_ROLES);
    const questionPoints = questionInputs.reduce(
      (total, question) => total + question.points,
      0,
    );
    if (questionPoints > input.pointsPossible) {
      throw new DataAccessError(
        "Question points cannot exceed the quiz's total points.",
      );
    }
    const quizId = input.id ?? this.createId("quiz");
    const questions = questionInputs.map((question) => ({
      ...question,
      id: question.id ?? this.createId("question"),
      quizId,
    }));
    const quiz: Quiz = {
      ...input,
      id: quizId,
      authorId: actor.id,
      createdAt: input.createdAt ?? new Date().toISOString(),
      status: input.status ?? "draft",
      questionIds: questions.map((question) => question.id),
    };
    this.update((draft) => {
      draft.quizzes.unshift(quiz);
      draft.questions.unshift(...questions);
      draft.assignments.unshift({
        id: quiz.id,
        classId: quiz.classId,
        authorId: quiz.authorId,
        title: quiz.title,
        instructions: quiz.instructions,
        pointsPossible: quiz.pointsPossible,
        dueAt: quiz.dueAt,
        createdAt: quiz.createdAt,
        status: quiz.status,
      });
    });
    return quiz;
  }

  createMaterial(
    input: NewEntity<Material, "authorId" | "createdAt">,
  ): Material {
    const actor = this.requireClassRole(input.classId, TEACHING_ROLES);
    const material: Material = {
      ...input,
      id: input.id ?? this.createId("material"),
      authorId: actor.id,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.update((draft) => {
      draft.materials.unshift(material);
    });
    return material;
  }

  submitAssignment(input: CreateSubmissionInput): Submission {
    const student = this.requireRole(["student"]);
    const assignment = this.snapshot.assignments.find(
      (candidate) => candidate.id === input.assignmentId,
    );
    if (!assignment || assignment.status !== "published") {
      throw new DataAccessError("That assignment is unavailable for submission.");
    }
    this.requireClassAccess(assignment.classId);

    const existing = this.snapshot.submissions.find(
      (submission) =>
        submission.assignmentId === assignment.id &&
        submission.studentId === student.id,
    );
    const timestamp = new Date().toISOString();
    const submission: Submission = {
      id: existing?.id ?? this.createId("submission"),
      assignmentId: assignment.id,
      studentId: student.id,
      text: input.text,
      attachmentSources: [...(input.attachmentSources ?? [])],
      status: input.status ?? "submitted",
      submittedAt: input.status === "draft" ? undefined : timestamp,
      updatedAt: timestamp,
    };
    this.update((draft) => {
      if (existing) {
        draft.submissions = draft.submissions.map((item) =>
          item.id === existing.id ? submission : item,
        );
      } else {
        draft.submissions.unshift(submission);
      }
    });
    return submission;
  }

  createQuizAttempt(input: CreateQuizAttemptInput): DataSnapshot["quizAttempts"][number] {
    const student = this.requireRole(["student"]);
    const quiz = this.snapshot.quizzes.find(
      (candidate) => candidate.id === input.quizId,
    );
    if (!quiz || quiz.status !== "published") {
      throw new DataAccessError("That quiz is unavailable.");
    }
    this.requireClassAccess(quiz.classId);
    const questions = this.snapshot.questions.filter(
      (question) => question.quizId === quiz.id,
    );
    const questionIds = new Set(questions.map((question) => question.id));
    for (const questionId of Object.keys(input.answers)) {
      if (!questionIds.has(questionId)) {
        throw new DataAccessError("The quiz response contains an unknown question.");
      }
      const question = questions.find((item) => item.id === questionId);
      const answer = input.answers[questionId];
      if (
        question?.type === "multiple-choice" &&
        (typeof answer !== "number" ||
          !Number.isInteger(answer) ||
          answer < 0 ||
          answer >= question.options.length)
      ) {
        throw new DataAccessError("Choose a valid option for each quiz question.");
      }
      if (question?.type === "short-answer" && typeof answer !== "string") {
        throw new DataAccessError("Short-answer responses must be text.");
      }
    }
    const timestamp = new Date().toISOString();
    const attempt: DataSnapshot["quizAttempts"][number] = {
      id: this.createId("quiz-attempt"),
      quizId: quiz.id,
      studentId: student.id,
      answers: { ...input.answers },
      status: input.status ?? "submitted",
      startedAt: timestamp,
      submittedAt: input.status === "draft" ? undefined : timestamp,
    };
    this.update((draft) => {
      draft.quizAttempts.unshift(attempt);
    });
    return attempt;
  }

  gradeSubmission(
    submissionId: EntityId,
    input: GradeSubmissionInput,
  ): Grade {
    const submission = this.requireSubmission(submissionId);
    const assignment = this.snapshot.assignments.find(
      (candidate) => candidate.id === submission.assignmentId,
    );
    if (!assignment) {
      throw new DataAccessError("The submission's assignment could not be found.");
    }
    const grader = this.requireClassRole(assignment.classId, TEACHING_ROLES);
    if (
      input.pointsEarned < 0 ||
      input.pointsPossible <= 0 ||
      input.pointsEarned > input.pointsPossible ||
      input.pointsPossible > assignment.pointsPossible
    ) {
      throw new DataAccessError("Grade points must be within the assignment's point limit.");
    }
    const grade: Grade = {
      id: this.createId("grade"),
      submissionId,
      graderId: grader.id,
      pointsEarned: input.pointsEarned,
      pointsPossible: input.pointsPossible,
      gradedAt: new Date().toISOString(),
    };
    this.update((draft) => {
      draft.grades = draft.grades.filter((item) => item.submissionId !== submissionId);
      draft.grades.unshift(grade);
    });
    return grade;
  }

  returnSubmission(
    submissionId: EntityId,
    input: ReturnSubmissionInput,
  ): void {
    const submission = this.requireSubmission(submissionId);
    const assignment = this.snapshot.assignments.find(
      (candidate) => candidate.id === submission.assignmentId,
    );
    if (!assignment) {
      throw new DataAccessError("The submission's assignment could not be found.");
    }
    const grader = this.requireClassRole(assignment.classId, TEACHING_ROLES);
    if (
      input.grade &&
      (input.grade.pointsEarned < 0 ||
        input.grade.pointsPossible <= 0 ||
        input.grade.pointsEarned > input.grade.pointsPossible ||
        input.grade.pointsPossible > assignment.pointsPossible)
    ) {
      throw new DataAccessError("Grade points must be within the assignment's point limit.");
    }
    const now = new Date().toISOString();
    const grade = input.grade
      ? {
          id: this.createId("grade"),
          submissionId,
          graderId: grader.id,
          pointsEarned: input.grade.pointsEarned,
          pointsPossible: input.grade.pointsPossible,
          gradedAt: now,
        }
      : undefined;
    const feedback = input.feedback?.trim()
      ? {
          id: this.createId("feedback"),
          submissionId,
          authorId: grader.id,
          body: input.feedback.trim(),
          createdAt: now,
        }
      : undefined;
    this.update((draft) => {
      draft.submissions = draft.submissions.map((item) =>
        item.id === submissionId
          ? { ...item, status: "returned", updatedAt: now }
          : item,
      );
      if (grade) {
        draft.grades = [
          grade,
          ...draft.grades.filter((item) => item.submissionId !== submissionId),
        ];
      }
      if (feedback) {
        draft.feedback = [
          feedback,
          ...draft.feedback.filter((item) => item.submissionId !== submissionId),
        ];
      }
    });
  }

  addFeedback(submissionId: EntityId, body: string): Feedback {
    const submission = this.requireSubmission(submissionId);
    const assignment = this.snapshot.assignments.find(
      (candidate) => candidate.id === submission.assignmentId,
    );
    if (!assignment) {
      throw new DataAccessError("The submission's assignment could not be found.");
    }
    const author = this.requireClassRole(assignment.classId, TEACHING_ROLES);
    const feedback: Feedback = {
      id: this.createId("feedback"),
      submissionId,
      authorId: author.id,
      body,
      createdAt: new Date().toISOString(),
    };
    this.update((draft) => {
      draft.feedback.unshift(feedback);
    });
    return feedback;
  }

  saveNote(
    input: NewEntity<Note, "userId" | "createdAt" | "updatedAt">,
  ): Note {
    const user = this.requireUser();
    if (input.userId !== user.id && user.role !== "admin") {
      throw new DataAccessError("You may only save notes to your own account.");
    }
    if (input.classId) {
      this.requireClassAccess(input.classId);
    }
    const existing = input.id
      ? this.snapshot.notes.find((note) => note.id === input.id)
      : undefined;
    if (existing && existing.userId !== user.id && user.role !== "admin") {
      throw new DataAccessError("You may only edit your own notes.");
    }
    const timestamp = new Date().toISOString();
    const note: Note = {
      ...input,
      id: existing?.id ?? input.id ?? this.createId("note"),
      userId: existing?.userId ?? user.id,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.update((draft) => {
      draft.notes = [note, ...draft.notes.filter((item) => item.id !== note.id)];
    });
    return note;
  }

  deleteNote(noteId: EntityId): void {
    const user = this.requireUser();
    const note = this.snapshot.notes.find((item) => item.id === noteId);
    if (!note) {
      return;
    }
    if (note.userId !== user.id && user.role !== "admin") {
      throw new DataAccessError("You may only delete your own notes.");
    }
    this.update((draft) => {
      draft.notes = draft.notes.filter((item) => item.id !== noteId);
    });
  }

  private requireUser(): User {
    const user = this.getCurrentUser();
    if (!user) {
      throw new DataAccessError("Choose a demo user before continuing.");
    }
    return user;
  }

  private requireRole(roles: readonly UserRole[]): User {
    const user = this.requireUser();
    if (!roles.includes(user.role)) {
      throw new DataAccessError("Your demo role does not allow that action.");
    }
    return user;
  }

  private requireClassAccess(classId: EntityId): void {
    const user = this.requireUser();
    if (!this.snapshot.classes.some((classRoom) => classRoom.id === classId)) {
      throw new DataAccessError("That class does not exist.");
    }
    if (user.role === "admin") {
      return;
    }
    const hasMembership = this.snapshot.memberships.some(
      (membership) =>
        membership.classId === classId &&
        membership.userId === user.id &&
        membership.status === "active",
    );
    if (!hasMembership) {
      throw new DataAccessError("You do not have active membership in that class.");
    }
  }

  private requireClassRole(classId: EntityId, roles: readonly UserRole[]): User {
    const user = this.requireRole(roles);
    this.requireClassAccess(classId);
    if (
      user.role === "teacher" &&
      !this.snapshot.memberships.some(
        (membership) =>
          membership.classId === classId &&
          membership.userId === user.id &&
          membership.role === "teacher" &&
          membership.status === "active",
      )
    ) {
      throw new DataAccessError("Only a class teacher may manage class content.");
    }
    return user;
  }

  private requireSubmission(submissionId: EntityId): Submission {
    const submission = this.snapshot.submissions.find(
      (item) => item.id === submissionId,
    );
    if (!submission) {
      throw new DataAccessError("That submission does not exist.");
    }
    const assignment = this.snapshot.assignments.find(
      (item) => item.id === submission.assignmentId,
    );
    if (!assignment) {
      throw new DataAccessError("The submission's assignment could not be found.");
    }
    const user = this.requireUser();
    if (user.role === "student" && submission.studentId !== user.id) {
      throw new DataAccessError("You may only access your own submission.");
    }
    this.requireClassAccess(assignment.classId);
    return submission;
  }

  private createId(prefix: string): EntityId {
    return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  }

  private update(mutator: (draft: DataSnapshot) => void): void {
    const draft = this.getSnapshot();
    mutator(draft);
    const previous = this.snapshot;
    this.snapshot = draft;
    try {
      this.persistAndEmit();
    } catch (error) {
      this.snapshot = previous;
      throw error;
    }
  }

  private persistAndEmit(): void {
    this.store.save(this.snapshot);
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const classLensData = new LocalFirstClassLensService();

/** Convenience export for integrations that prefer a single named service object. */
export const dataService: ClassLensDataService = classLensData;
