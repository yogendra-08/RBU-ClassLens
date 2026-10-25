import * as React from "react";
import { useEffect, useState } from "react";
import type {
  NoteViewActivity,
  NotesActivityStore,
  TeacherNotesClass,
} from "./types";

export interface TeacherNoteViewsProps {
  teacherId: string;
  /** Only classes and rosters authorized for this teacher should be supplied. */
  classes: TeacherNotesClass[];
  activityStore: NotesActivityStore;
}

function formatTimestamp(timestamp: string | undefined): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function TeacherNoteViews({
  teacherId,
  classes,
  activityStore,
}: TeacherNoteViewsProps): React.ReactElement {
  const [activities, setActivities] = useState<NoteViewActivity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const authorizedClasses = classes.filter(
    (classroom) => classroom.teacherId === teacherId,
  );
  const authorizedClassIds = authorizedClasses.map((classroom) => classroom.id);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void activityStore
      .listForTeacher({ teacherId, classIds: authorizedClassIds })
      .then((result) => {
        if (!active) return;
        const classIds = new Set(authorizedClassIds);
        setActivities(
          result.filter(
            (activity) =>
              activity.teacherId === teacherId &&
              classIds.has(activity.classId),
          ),
        );
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Could not load note view records.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [activityStore, teacherId, authorizedClassIds.join("|")]);

  return (
    <section aria-labelledby="teacher-note-views-title">
      <h2 id="teacher-note-views-title">Note views</h2>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading note view records…</p>}
      {!loading && !error && authorizedClasses.map((classroom) => (
        <div key={classroom.id}>
          <h3>{classroom.name}</h3>
          {classroom.notes.map((note) => (
            <div key={note.id}>
              <h4>{note.title}</h4>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Status</th>
                    <th scope="col">First opened</th>
                  </tr>
                </thead>
                <tbody>
                  {classroom.students.map((student) => {
                    const activity = activities.find(
                      (item) =>
                        item.noteId === note.id &&
                        item.classId === classroom.id &&
                        item.studentId === student.id &&
                        item.teacherId === teacherId,
                    );
                    return (
                      <tr key={student.id}>
                        <td>{student.displayName}</td>
                        <td>{activity ? "Viewed" : "Not Viewed"}</td>
                        <td>{formatTimestamp(activity?.firstOpenedAt)}</td>
                      </tr>
                    );
                  })}
                  {classroom.students.length === 0 && (
                    <tr>
                      <td colSpan={3}>No students in this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
      {!loading && !error && authorizedClasses.length === 0 && (
        <p>No classes are available for this teacher.</p>
      )}
    </section>
  );
}
