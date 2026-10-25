import type { DataSnapshot } from "./models";

const now = "2026-10-20T09:00:00.000Z";

export const DEMO_USERS = [
  {
    id: "user-admin",
    displayName: "ClassLens Admin",
    email: "admin@demo.classlens.local",
    role: "admin",
  },
  {
    id: "user-teacher",
    displayName: "Dr. Ananya Rao",
    email: "ananya.rao@demo.classlens.local",
    role: "teacher",
  },
  {
    id: "user-student",
    displayName: "Aarav Mehta",
    email: "aarav.mehta@demo.classlens.local",
    role: "student",
  },
  {
    id: "user-student-2",
    displayName: "Mira Shah",
    email: "mira.shah@demo.classlens.local",
    role: "student",
  },
] as const satisfies DataSnapshot["users"];

export function createSeedSnapshot(): DataSnapshot {
  return {
    schemaVersion: 1,
    users: DEMO_USERS.map((user) => ({ ...user })),
    classes: [
      {
        id: "class-web",
        name: "Web Application Development",
        courseCode: "CSE-304",
        section: "A",
        description:
          "Build accessible, maintainable web applications with modern browser technologies.",
        teacherId: "user-teacher",
        classCode: "CSE304A",
        createdAt: "2026-08-01T08:00:00.000Z",
      },
      {
        id: "class-data",
        name: "Foundations of Data Science",
        courseCode: "CSE-322",
        section: "B",
        description:
          "Explore data preparation, visualisation, and responsible interpretation.",
        teacherId: "user-teacher",
        classCode: "CSE322B",
        createdAt: "2026-08-02T08:00:00.000Z",
      },
    ],
    memberships: [
      {
        id: "membership-teacher-web",
        classId: "class-web",
        userId: "user-teacher",
        role: "teacher",
        status: "active",
        joinedAt: "2026-08-01T08:00:00.000Z",
      },
      {
        id: "membership-student-web",
        classId: "class-web",
        userId: "user-student",
        role: "student",
        status: "active",
        joinedAt: "2026-08-04T08:00:00.000Z",
      },
      {
        id: "membership-student-2-web",
        classId: "class-web",
        userId: "user-student-2",
        role: "student",
        status: "active",
        joinedAt: "2026-08-04T08:05:00.000Z",
      },
      {
        id: "membership-teacher-data",
        classId: "class-data",
        userId: "user-teacher",
        role: "teacher",
        status: "active",
        joinedAt: "2026-08-02T08:00:00.000Z",
      },
      {
        id: "membership-student-data",
        classId: "class-data",
        userId: "user-student",
        role: "student",
        status: "active",
        joinedAt: "2026-08-05T08:00:00.000Z",
      },
    ],
    announcements: [
      {
        id: "announcement-welcome",
        classId: "class-web",
        authorId: "user-teacher",
        title: "Welcome to the course",
        body: "Our first workshop is on semantic HTML and accessible page structure.",
        createdAt: "2026-10-18T10:00:00.000Z",
        pinned: true,
      },
      {
        id: "announcement-data-lab",
        classId: "class-data",
        authorId: "user-teacher",
        title: "Lab materials are ready",
        body: "Bring your sample dataset to Thursday's data-cleaning lab.",
        createdAt: "2026-10-19T11:30:00.000Z",
        pinned: false,
      },
    ],
    announcementComments: [],
    classQuestions: [],
    assignments: [
      {
        id: "assignment-accessible-page",
        classId: "class-web",
        authorId: "user-teacher",
        title: "Accessible course landing page",
        instructions:
          "Create a responsive course landing page. Include a heading structure, meaningful links, and a brief accessibility checklist.",
        pointsPossible: 20,
        dueAt: "2026-10-29T17:00:00.000Z",
        createdAt: "2026-10-18T10:15:00.000Z",
        status: "published",
      },
      {
        id: "assignment-data-summary",
        classId: "class-data",
        authorId: "user-teacher",
        title: "Dataset summary",
        instructions:
          "Summarise one dataset, identify two data-quality concerns, and explain a suitable visualisation.",
        pointsPossible: 15,
        dueAt: "2026-10-31T17:00:00.000Z",
        createdAt: "2026-10-19T11:45:00.000Z",
        status: "published",
      },
    ],
    quizzes: [
      {
        id: "quiz-web-basics",
        classId: "class-web",
        authorId: "user-teacher",
        title: "HTML and accessibility check-in",
        instructions: "Choose the best answer for each question.",
        pointsPossible: 5,
        dueAt: "2026-10-30T17:00:00.000Z",
        createdAt: "2026-10-18T10:30:00.000Z",
        status: "published",
        questionIds: ["question-semantic-html", "question-alt-text"],
      },
    ],
    quizAttempts: [],
    questions: [
      {
        id: "question-semantic-html",
        quizId: "quiz-web-basics",
        type: "multiple-choice",
        prompt: "What is a primary benefit of semantic HTML?",
        points: 2,
        options: [
          "It communicates document structure to browsers and assistive technology.",
          "It guarantees every page loads instantly.",
          "It replaces the need for CSS.",
        ],
        correctOptionIndex: 0,
      },
      {
        id: "question-alt-text",
        quizId: "quiz-web-basics",
        type: "short-answer",
        prompt: "What should useful alternative text communicate?",
        points: 3,
        expectedAnswer:
          "The image's relevant purpose or information in its current context.",
      },
    ],
    materials: [
      {
        id: "material-mdn-html",
        classId: "class-web",
        authorId: "user-teacher",
        title: "MDN: HTML basics",
        description: "A reference for structuring pages with HTML.",
        kind: "link",
        source: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
        createdAt: "2026-10-18T10:20:00.000Z",
      },
      {
        id: "material-data-checklist",
        classId: "class-data",
        authorId: "user-teacher",
        title: "Data quality checklist",
        description: "A sample classroom handout filename, not an opened-file event.",
        kind: "document",
        source: "data-quality-checklist.pdf",
        createdAt: "2026-10-19T11:40:00.000Z",
      },
    ],
    submissions: [
      {
        id: "submission-data-summary-aarav",
        assignmentId: "assignment-data-summary",
        studentId: "user-student",
        text: "The sample dataset has a few missing values and inconsistent date formats.",
        attachmentSources: [],
        status: "submitted",
        submittedAt: "2026-10-20T08:40:00.000Z",
        updatedAt: "2026-10-20T08:40:00.000Z",
      },
    ],
    grades: [
      {
        id: "grade-data-summary-aarav",
        submissionId: "submission-data-summary-aarav",
        graderId: "user-teacher",
        pointsEarned: 12,
        pointsPossible: 15,
        gradedAt: "2026-10-21T10:00:00.000Z",
      },
    ],
    feedback: [
      {
        id: "feedback-data-summary-aarav",
        submissionId: "submission-data-summary-aarav",
        authorId: "user-teacher",
        body: "Good start. Add a sentence explaining why your chosen visualisation fits the data.",
        createdAt: "2026-10-21T10:05:00.000Z",
      },
    ],
    notes: [
      {
        id: "note-semantic-html",
        userId: "user-student",
        classId: "class-web",
        title: "Semantic HTML reminders",
        body: "Use elements for their meaning; keep headings in a logical order.",
        createdAt: "2026-10-19T12:00:00.000Z",
        updatedAt: "2026-10-19T12:00:00.000Z",
      },
    ],
    session: {
      userId: "user-student",
      startedAt: now,
      mode: "demo",
    },
  };
}
