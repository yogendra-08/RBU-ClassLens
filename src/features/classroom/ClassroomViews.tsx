import type { ReactNode } from "react";
import type {
  Announcement,
  Classroom,
  ClassroomNotification,
  ClassroomPerson,
  ClassworkItem,
  StudentSubmission,
} from "./types";

export function Avatar({ person, size = "normal" }: { person: ClassroomPerson; size?: "normal" | "large" }) {
  const initials = person.initials || person.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2);
  return <span className={`cl-avatar cl-avatar-${size}`} aria-label={person.name}>{initials}</span>;
}

export function ClassCard({ classroom, onSelect }: { classroom: Classroom; onSelect: () => void }) {
  return (
    <button className="cl-class-card" onClick={onSelect} type="button">
      <span className="cl-card-cover" style={{ backgroundColor: classroom.color }}>
        <span className="cl-card-subject">{classroom.subject}</span>
        <span className="cl-card-mark" aria-hidden="true">{classroom.subject.slice(0, 1)}</span>
        <span className="cl-card-heading">{classroom.name}</span>
        <span className="cl-card-section">{classroom.section}</span>
      </span>
      <span className="cl-card-content">
        <span className="cl-card-description">{classroom.description}</span>
        <span className="cl-card-meta">{classroom.room}</span>
      </span>
      <span className="cl-card-footer">
        <Avatar person={classroom.teacher} />
        <span>{classroom.students.length} people</span>
        <span className="cl-card-open" aria-hidden="true">↗</span>
      </span>
    </button>
  );
}

export function ClassBanner({ classroom, onBack }: { classroom: Classroom; onBack: () => void }) {
  return (
    <header className="cl-class-banner" style={{ backgroundColor: classroom.color }}>
      <button className="cl-back-button" onClick={onBack} type="button" aria-label="Back to classes">←</button>
      <span className="cl-banner-mark" aria-hidden="true">{classroom.subject.slice(0, 1)}</span>
      <div className="cl-banner-copy">
        <div className="cl-banner-eyebrow">{classroom.subject} <span>·</span> {classroom.section}</div>
        <h1>{classroom.name}</h1>
        <p>{classroom.room}</p>
      </div>
      <span className="cl-banner-code">Class code <strong>{classroom.code}</strong></span>
    </header>
  );
}

export function EmptyState({ icon, title, detail, action }: { icon: string; title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="cl-empty">
      <span className="cl-empty-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function AnnouncementCard({ announcement, onComment }: { announcement: Announcement; onComment: () => void }) {
  return (
    <article className="cl-panel cl-announcement">
      <div className="cl-post-top">
        <Avatar person={announcement.author} />
        <div className="cl-post-author">
          <strong>{announcement.author.name}</strong>
          <span>{formatTime(announcement.createdAt)}</span>
        </div>
        <button className="cl-icon-button cl-more" type="button" aria-label="More announcement actions">···</button>
      </div>
      <p className="cl-post-body">{announcement.body}</p>
      <button className="cl-comment-link" type="button" onClick={onComment}>
        ◯ {announcement.comments ? `${announcement.comments} comments` : "Add class comment"}
      </button>
    </article>
  );
}

export function ClassworkCard({
  item,
  submission,
  role,
  onOpen,
}: {
  item: ClassworkItem;
  submission?: StudentSubmission;
  role: "teacher" | "student";
  onOpen: () => void;
}) {
  const typeLabel = item.type[0].toUpperCase() + item.type.slice(1);
  const marker: Record<ClassworkItem["type"], string> = {
    assignment: "▤",
    quiz: "✓",
    question: "?",
    material: "▧",
  };
  return (
    <button className="cl-panel cl-work-card" type="button" onClick={onOpen}>
      <span className={`cl-work-icon cl-work-${item.type}`} aria-hidden="true">{marker[item.type]}</span>
      <span className="cl-work-copy">
        <span className="cl-work-title">{item.title}</span>
        <span className="cl-work-meta">
          {item.topic || typeLabel} <span>·</span> {formatTime(item.createdAt)}
        </span>
      </span>
      {role === "student" && item.type !== "material" && <StatusBadge status={submission?.status || "assigned"} />}
      {role === "teacher" && item.dueAt && <span className="cl-work-due">Due {formatDate(item.dueAt)}</span>}
      <span className="cl-work-arrow" aria-hidden="true">›</span>
    </button>
  );
}

export function StatusBadge({ status }: { status: StudentSubmission["status"] }) {
  const labels: Record<StudentSubmission["status"], string> = {
    assigned: "Assigned",
    "turned-in": "Turned in",
    returned: "Returned",
    missing: "Missing",
  };
  return <span className={`cl-status cl-status-${status}`}>{labels[status]}</span>;
}

export function PeopleView({ classroom }: { classroom: Classroom }) {
  return (
    <div className="cl-people-layout">
      <PeopleGroup title="Teachers" count={1} people={[classroom.teacher]} />
      <PeopleGroup title="Classmates" count={classroom.students.length} people={classroom.students} />
    </div>
  );
}

function PeopleGroup({ title, count, people }: { title: string; count: number; people: ClassroomPerson[] }) {
  return (
    <section className="cl-panel cl-people-group">
      <div className="cl-section-title">
        <h2>{title}</h2>
        <span>{count}</span>
      </div>
      {people.map((person) => (
        <div className="cl-person-row" key={person.id}>
          <Avatar person={person} />
          <span className="cl-person-name">{person.name}</span>
          {person.email && <span className="cl-person-email">{person.email}</span>}
          {person.role === "teacher" && <span className="cl-role-label">Teacher</span>}
        </div>
      ))}
    </section>
  );
}

export function GradesView({
  classroom,
  onReview,
}: {
  classroom: Classroom;
  onReview: (item: ClassworkItem, student: ClassroomPerson) => void;
}) {
  const gradedItems = classroom.classwork.filter((item) => item.type !== "material");
  if (!gradedItems.length) {
    return <EmptyState icon="▤" title="No graded work yet" detail="Assignments, quizzes, and questions will appear here." />;
  }
  return (
    <section className="cl-panel cl-grades-panel">
      <div className="cl-section-title">
        <div><h2>Student work</h2><p>Review submission status and provide feedback.</p></div>
        <span className="cl-grade-count">{classroom.students.length} students</span>
      </div>
      <div className="cl-grade-list">
        {gradedItems.map((item) => (
          <div className="cl-grade-item" key={item.id}>
            <div className="cl-grade-item-title">
              <span className="cl-work-icon cl-work-assignment">▤</span>
              <div><strong>{item.title}</strong><small>{item.points ?? "—"} points · {item.dueAt ? `Due ${formatDate(item.dueAt)}` : "No due date"}</small></div>
            </div>
            {classroom.students.map((student) => {
              const submission = classroom.submissions.find((entry) => entry.itemId === item.id && entry.studentId === student.id);
              return (
                <button className="cl-grade-student" key={student.id} type="button" disabled={!submission} onClick={() => onReview(item, student)}>
                  <Avatar person={student} />
                  <span>{student.name}</span>
                  <span className="cl-grade-student-status">{submission?.grade !== undefined ? `${submission.grade}/${item.points ?? "—"}` : submission?.status === "turned-in" ? "Review" : "Assigned"}</span>
                  <span aria-hidden="true">›</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SettingsView({
  classroom,
  onToggleNotifications,
  onCopyCode,
  copied,
}: {
  classroom: Classroom;
  onToggleNotifications: () => void;
  onCopyCode: () => void;
  copied: boolean;
}) {
  return (
    <div className="cl-settings-layout">
      <section className="cl-panel cl-settings-card">
        <div className="cl-section-title"><div><h2>Class information</h2><p>Details visible to people in this classroom.</p></div></div>
        <dl className="cl-details-list">
          <div><dt>Class name</dt><dd>{classroom.name}</dd></div>
          <div><dt>Section</dt><dd>{classroom.section}</dd></div>
          <div><dt>Subject</dt><dd>{classroom.subject}</dd></div>
          <div><dt>Room</dt><dd>{classroom.room}</dd></div>
          <div><dt>Description</dt><dd>{classroom.description}</dd></div>
        </dl>
      </section>
      <section className="cl-panel cl-settings-card">
        <div className="cl-section-title"><div><h2>Class code</h2><p>Share this code with students in your class.</p></div></div>
        <div className="cl-class-code">{classroom.code}<button className="cl-button cl-button-secondary" onClick={onCopyCode} type="button">{copied ? "Copied" : "Copy code"}</button></div>
      </section>
      <section className="cl-panel cl-settings-card">
        <div className="cl-section-title"><div><h2>Notifications</h2><p>Choose whether to receive updates for this class.</p></div></div>
        <label className="cl-switch-row">
          <span><strong>Class notifications</strong><small>Announcements, new work, and returned work</small></span>
          <input type="checkbox" checked={Boolean(classroom.notificationsEnabled)} onChange={onToggleNotifications} />
        </label>
      </section>
    </div>
  );
}

export function NotificationsView({
  notifications,
  classNames,
  onOpen,
  onMarkRead,
}: {
  notifications: ClassroomNotification[];
  classNames: Map<string, string>;
  onOpen: (notification: ClassroomNotification) => void;
  onMarkRead: (notificationId: string) => void;
}) {
  return notifications.length ? (
    <div className="cl-notification-list">
      {notifications.map((notification) => (
        <article className={`cl-panel cl-notification ${notification.read ? "" : "is-unread"}`} key={notification.id}>
          <span className="cl-notification-dot" aria-hidden="true" />
          <button type="button" className="cl-notification-content" onClick={() => onOpen(notification)}>
            <strong>{notification.title}</strong>
            <span>{notification.detail}</span>
            <small>{classNames.get(notification.classId) || "Class"} · {formatTime(notification.createdAt)}</small>
          </button>
          {!notification.read && <button type="button" className="cl-mark-read" onClick={() => onMarkRead(notification.id)}>Mark read</button>}
        </article>
      ))}
    </div>
  ) : <EmptyState icon="◌" title="You're all caught up" detail="Class updates will appear here." />;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export function formatTime(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
