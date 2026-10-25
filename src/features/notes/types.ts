export interface AuthenticatedStudent {
  id: string;
  displayName: string;
}

export interface NoteDocument {
  id: string;
  title: string;
  classId: string;
  teacherId: string;
}

export interface NoteViewActivity {
  noteId: string;
  classId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  firstOpenedAt: string;
}

export type RecordFirstOpenInput = Omit<NoteViewActivity, "firstOpenedAt">;

export interface TeacherActivityScope {
  teacherId: string;
  classIds: string[];
}

/**
 * Production adapters should enforce the same teacher/class authorization on the server.
 * The localStorage implementation is intended for local demos, not as an authorization boundary.
 */
export interface NotesActivityStore {
  recordFirstOpen(input: RecordFirstOpenInput): Promise<NoteViewActivity>;
  listForTeacher(scope: TeacherActivityScope): Promise<NoteViewActivity[]>;
}

export interface TeacherNote {
  id: string;
  title: string;
}

export interface TeacherStudent {
  id: string;
  displayName: string;
}

/** Class and roster data supplied to the teacher view must already be teacher-authorized. */
export interface TeacherNotesClass {
  id: string;
  name: string;
  teacherId: string;
  notes: TeacherNote[];
  students: TeacherStudent[];
}
