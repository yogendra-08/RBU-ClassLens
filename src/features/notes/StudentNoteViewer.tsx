import * as React from "react";
import { useEffect, useRef, useState } from "react";
import type {
  AuthenticatedStudent,
  NoteDocument,
  NotesActivityStore,
} from "./types";

export interface StudentNoteViewerProps {
  note: NoteDocument;
  /** Identity must come from the application's authenticated session. */
  student: AuthenticatedStudent;
  activityStore: NotesActivityStore;
  /** Optional URL for a real, local sample PDF supplied by the integrating app. */
  samplePdfUrl?: string;
  samplePdfLabel?: string;
}

export function StudentNoteViewer({
  note,
  student,
  activityStore,
  samplePdfUrl,
  samplePdfLabel = "sample PDF",
}: StudentNoteViewerProps): React.ReactElement {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const recordedOpen = useRef<string | null>(null);

  useEffect(() => {
    setDocumentUrl(null);
    setMessage("");
  }, [note.id]);

  const recordFirstOpen = async () => {
    if (!student.id.trim()) {
      setMessage("Sign in as a student before opening this note.");
      return;
    }
    const key = `${note.id}:${student.id}`;
    if (recordedOpen.current === key) return;

    try {
      await activityStore.recordFirstOpen({
        noteId: note.id,
        classId: note.classId,
        teacherId: note.teacherId,
        studentId: student.id,
        studentName: student.displayName,
      });
      recordedOpen.current = key;
      setMessage("First-open timestamp saved.");
    } catch (error) {
      const detail = error instanceof Error ? ` ${error.message}` : "";
      setMessage(`The PDF opened, but its first-open event could not be saved.${detail}`);
    }
  };

  const openSample = () => {
    if (!samplePdfUrl) return;
    setMessage("");
    setDocumentUrl(samplePdfUrl);
  };

  return (
    <section aria-labelledby="student-note-title">
      <h2 id="student-note-title">{note.title}</h2>
      {samplePdfUrl && (
        <button type="button" onClick={openSample}>
          Open {samplePdfLabel}
        </button>
      )}
      {!samplePdfUrl && <p role="status">A PDF preview is not attached to this sample material.</p>}
      <p role="status" aria-live="polite">{message}</p>
      {documentUrl && (
        <iframe
          title={`${note.title} PDF`}
          src={documentUrl}
          width="100%"
          height="640"
          style={{ border: 0 }}
          onLoad={() => void recordFirstOpen()}
        />
      )}
    </section>
  );
}
