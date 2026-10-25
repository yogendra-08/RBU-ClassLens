import type {
  Announcement,
  AnnouncementComment,
  Classroom,
  ClassroomNotification,
  ClassroomPerson,
  ClassworkItem,
  StudentSubmission,
} from "./types";

export const demoTeacher: ClassroomPerson = {
  id: "teacher-ava",
  name: "Ava Bennett",
  email: "ava.bennett@example.edu",
  role: "teacher",
  initials: "AB",
};

export const demoStudent: ClassroomPerson = {
  id: "student-jordan",
  name: "Jordan Lee",
  email: "jordan.lee@example.edu",
  role: "student",
  initials: "JL",
};

const students: ClassroomPerson[] = [
  demoStudent,
  { id: "student-maya", name: "Maya Patel", email: "maya.patel@example.edu", role: "student", initials: "MP" },
  { id: "student-noah", name: "Noah Kim", email: "noah.kim@example.edu", role: "student", initials: "NK" },
  { id: "student-sam", name: "Sam Rivera", email: "sam.rivera@example.edu", role: "student", initials: "SR" },
];
const now = Date.now();
const ago = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const soon = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
const sampleComments: AnnouncementComment[] = [
  { id: "comment-welcome-1", announcementId: "announcement-welcome", author: demoStudent, body: "Looking forward to it!", createdAt: ago(2) },
  { id: "comment-welcome-2", announcementId: "announcement-welcome", author: students[1], body: "Should we bring our notebooks too?", createdAt: ago(1) },
];

const announcements: Announcement[] = [
  {
    id: "announcement-welcome",
    classId: "class-biology",
    author: demoTeacher,
    body: "Welcome to our class! This week we'll explore how ecosystems stay in balance. Bring your field journals on Thursday.",
    createdAt: ago(3),
    comments: 2,
    commentEntries: sampleComments,
  },
  {
    id: "announcement-lab",
    classId: "class-biology",
    author: demoTeacher,
    body: "A quick reminder: our observation lab begins at 10:15 tomorrow. Meet by the greenhouse entrance.",
    createdAt: ago(28),
    comments: 0,
  },
];

const classwork: ClassworkItem[] = [
  {
    id: "work-ecosystems",
    classId: "class-biology",
    type: "assignment",
    title: "Ecosystem field notes",
    instructions: "Record three interactions you observe and describe how each one helps the ecosystem.",
    topic: "Ecosystems",
    dueAt: soon(2),
    points: 20,
    createdAt: ago(12),
    author: demoTeacher,
    attachmentName: "Field-notes-guide.pdf",
  },
  {
    id: "work-food-web",
    classId: "class-biology",
    type: "quiz",
    title: "Food webs check-in",
    instructions: "A short review of producers, consumers, and energy flow.",
    topic: "Ecosystems",
    dueAt: soon(4),
    points: 10,
    createdAt: ago(36),
    author: demoTeacher,
  },
  {
    id: "work-observation",
    classId: "class-biology",
    type: "question",
    title: "What makes a habitat healthy?",
    instructions: "Share one sign of a healthy habitat and explain your reasoning.",
    topic: "Ecosystems",
    points: 5,
    createdAt: ago(60),
    author: demoTeacher,
  },
  {
    id: "work-reading",
    classId: "class-biology",
    type: "material",
    title: "Ecosystem reading",
    instructions: "Optional reading to prepare for our next discussion.",
    topic: "Resources",
    createdAt: ago(96),
    author: demoTeacher,
    attachmentName: "Ecosystems-reader.pdf",
  },
];

const submissions: StudentSubmission[] = [
  {
    itemId: "work-ecosystems",
    studentId: demoStudent.id,
    status: "assigned",
    response: "",
  },
  {
    itemId: "work-food-web",
    studentId: demoStudent.id,
    status: "returned",
    turnedInAt: ago(24),
    grade: 8,
    feedback: "Nice work tracing the energy flow. Review the decomposer example from class.",
    response: "The grass is the producer, then the grasshopper and frog are consumers.",
  },
  {
    itemId: "work-observation",
    studentId: demoStudent.id,
    status: "turned-in",
    turnedInAt: ago(2),
    response: "A habitat needs a variety of plants and places to find shelter.",
  },
];

export const demoClassrooms: Classroom[] = [
  {
    id: "class-biology",
    name: "Biology in Our World",
    section: "Section 02",
    subject: "Biology",
    room: "Science · Room 204",
    code: "bio-7k2p9",
    description: "Discover living systems, from tiny cells to thriving ecosystems.",
    color: "#4b8e78",
    teacher: demoTeacher,
    students,
    announcements,
    classwork,
    submissions,
    notificationsEnabled: true,
  },
  {
    id: "class-literature",
    name: "Stories & Storytelling",
    section: "Section 01",
    subject: "Literature",
    room: "Humanities · Room 118",
    code: "lit-3m8qa",
    description: "Read closely, ask thoughtful questions, and find your own voice.",
    color: "#bd7752",
    teacher: { ...demoTeacher, name: "Morgan Ellis", initials: "ME" },
    students: students.slice(0, 3),
    announcements: [],
    classwork: [],
    submissions: [],
    notificationsEnabled: true,
  },
  {
    id: "class-math",
    name: "Mathematical Thinking",
    section: "Section 03",
    subject: "Mathematics",
    room: "North Hall · Room 302",
    code: "math-9u4xd",
    description: "Make sense of patterns and build confidence solving problems.",
    color: "#637bb2",
    teacher: { ...demoTeacher, name: "Chris Morgan", initials: "CM" },
    students: students.slice(0, 2),
    announcements: [],
    classwork: [],
    submissions: [],
    notificationsEnabled: false,
  },
];

export const demoNotifications: ClassroomNotification[] = [
  {
    id: "notification-assignment",
    classId: "class-biology",
    title: "New assignment",
    detail: "Ava Bennett posted Ecosystem field notes",
    createdAt: ago(12),
    read: false,
  },
  {
    id: "notification-grade",
    classId: "class-biology",
    title: "Work returned",
    detail: "Food webs check-in has feedback",
    createdAt: ago(24),
    read: true,
  },
  {
    id: "notification-announcement",
    classId: "class-biology",
    title: "Class announcement",
    detail: "Ava Bennett posted a class update",
    createdAt: ago(28),
    read: true,
  },
];

export function createDemoClasswork(
  classId: string,
  author: ClassroomPerson,
  values: Pick<ClassworkItem, "type" | "title" | "instructions" | "topic" | "dueAt" | "points">,
): ClassworkItem {
  return {
    ...values,
    id: `work-${Date.now()}`,
    classId,
    createdAt: new Date().toISOString(),
    author,
  };
}
