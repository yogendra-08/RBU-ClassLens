import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createDemoClasswork, demoClassrooms, demoNotifications, demoStudent, demoTeacher } from "./demoData";
import {
  AnnouncementCard,
  Avatar,
  ClassBanner,
  ClassCard,
  ClassworkCard,
  EmptyState,
  GradesView,
  NotificationsView,
  PeopleView,
  SettingsView,
  StatusBadge,
  formatDate,
} from "./ClassroomViews";
import type {
  Announcement,
  AnnouncementComment,
  Classroom,
  ClassroomAppProps,
  ClassroomNotification,
  ClassroomPerson,
  ClassroomTab,
  ClassworkItem,
  ClassworkType,
  StudentSubmission,
} from "./types";
import "./classroom.css";

type AppPage = "classes" | "notifications";

export function ClassroomApp({
  classes: suppliedClasses,
  currentUser: suppliedUser,
  notifications: suppliedNotifications,
  demoMode = true,
  onAnnouncementCreate,
  onAnnouncementComment,
  onClassworkCreate,
  onSubmissionUpdate,
  onGradeUpdate,
  onClassUpdate,
  onNotificationRead,
  onUserChange,
  onHome,
  onClassSelect,
  initialClassId,
  initialTab = "stream",
  onMutationError,
}: ClassroomAppProps) {
  const [classes, setClasses] = useState<Classroom[]>(() => cloneClasses(suppliedClasses || (demoMode ? demoClassrooms : [])));
  const [user, setUser] = useState<ClassroomPerson>(suppliedUser || (demoMode ? demoStudent : { id: "local-user", name: "Classroom User", role: "student" }));
  const [notifications, setNotifications] = useState<ClassroomNotification[]>(() => [...(suppliedNotifications || (demoMode ? demoNotifications : []))]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId ?? null);
  const [page, setPage] = useState<AppPage>("classes");
  const [tab, setTab] = useState<ClassroomTab>(initialTab);
  const [showWorkComposer, setShowWorkComposer] = useState(false);
  const [showAnnouncementComposer, setShowAnnouncementComposer] = useState(false);
  const [selectedWork, setSelectedWork] = useState<ClassworkItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ item: ClassworkItem; student: ClassroomPerson } | null>(null);
  const [commentTarget, setCommentTarget] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (suppliedClasses) setClasses(cloneClasses(suppliedClasses));
  }, [suppliedClasses]);

  useEffect(() => {
    if (suppliedUser) setUser(suppliedUser);
  }, [suppliedUser]);

  useEffect(() => {
    if (suppliedNotifications) setNotifications([...suppliedNotifications]);
  }, [suppliedNotifications]);

  useEffect(() => {
    setSelectedClassId(initialClassId ?? null);
    setTab(initialTab);
    setPage("classes");
  }, [initialClassId, initialTab]);

  const selectedClass = classes.find((classroom) => classroom.id === selectedClassId) || null;
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const filteredClasses = classes.filter((classroom) =>
    `${classroom.name} ${classroom.subject} ${classroom.section}`.toLowerCase().includes(search.toLowerCase()),
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function updateClass(classId: string, update: (classroom: Classroom) => Classroom) {
    const classroom = classes.find((entry) => entry.id === classId);
    if (!classroom) return;
    const next = update(classroom);
    setClasses((current) => current.map((entry) => entry.id === classId ? next : entry));
    onClassUpdate?.(next);
  }

  function openClass(classroom: Classroom) {
    setSelectedClassId(classroom.id);
    setPage("classes");
    setTab("stream");
    onClassSelect?.(classroom);
  }

  function addAnnouncement(body: string) {
    if (!selectedClass) return;
    const announcement: Announcement = {
      id: `announcement-${Date.now()}`,
      classId: selectedClass.id,
      author: user,
      body,
      createdAt: new Date().toISOString(),
      comments: 0,
      commentEntries: [],
    };
    if (!runMutation(() => onAnnouncementCreate?.(announcement))) return;
    updateClass(selectedClass.id, (classroom) => ({ ...classroom, announcements: [announcement, ...classroom.announcements] }));
    setShowAnnouncementComposer(false);
    notify("Announcement posted");
  }

  function addComment(body: string) {
    if (!selectedClass || !commentTarget) return;
    const comment: AnnouncementComment = {
      id: `comment-${Date.now()}`,
      announcementId: commentTarget.id,
      author: user,
      body,
      createdAt: new Date().toISOString(),
    };
    if (!runMutation(() => onAnnouncementComment?.(comment))) return;
    updateClass(selectedClass.id, (classroom) => ({
      ...classroom,
      announcements: classroom.announcements.map((announcement) => announcement.id === commentTarget.id
        ? { ...announcement, comments: (announcement.comments || 0) + 1, commentEntries: [...(announcement.commentEntries || []), comment] }
        : announcement),
    }));
    setCommentTarget((current) => current ? { ...current, comments: (current.comments || 0) + 1, commentEntries: [...(current.commentEntries || []), comment] } : current);
    notify("Comment added");
  }

  function addWork(values: Pick<ClassworkItem, "type" | "title" | "instructions" | "topic" | "dueAt" | "points" | "attachmentName" | "attachmentSource">) {
    if (!selectedClass) return;
    const item = createDemoClasswork(selectedClass.id, user, values);
    if (!runMutation(() => onClassworkCreate?.(item))) return;
    updateClass(selectedClass.id, (classroom) => ({ ...classroom, classwork: [item, ...classroom.classwork] }));
    setShowWorkComposer(false);
    notify(`${capitalize(values.type)} posted`);
  }

  function saveSubmission(submission: StudentSubmission): boolean {
    if (!selectedClass) return false;
    const saved = runMutation(() => {
      if (submission.status === "returned") onGradeUpdate?.(submission);
      else onSubmissionUpdate?.(submission);
    });
    if (!saved) return false;
    updateClass(selectedClass.id, (classroom) => {
      const exists = classroom.submissions.some((entry) => entry.itemId === submission.itemId && entry.studentId === submission.studentId);
      const submissions = exists
        ? classroom.submissions.map((entry) => entry.itemId === submission.itemId && entry.studentId === submission.studentId ? submission : entry)
        : [...classroom.submissions, submission];
      return { ...classroom, submissions };
    });
    return true;
  }

  function runMutation(action: () => void): boolean {
    try {
      action();
      return true;
    } catch (error) {
      onMutationError?.(error instanceof Error ? error : new Error("The change could not be saved."));
      return false;
    }
  }

  function markRead(notificationId: string) {
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, read: true } : notification));
    onNotificationRead?.(notificationId);
  }

  function openNotification(notification: ClassroomNotification) {
    markRead(notification.id);
    const classroom = classes.find((entry) => entry.id === notification.classId);
    if (classroom) openClass(classroom);
  }

  const headerTitle = selectedClass ? selectedClass.name : page === "notifications" ? "Notifications" : "Your classrooms";
  const classNames = useMemo(() => new Map(classes.map((classroom) => [classroom.id, classroom.name])), [classes]);

  return (
    <div className="cl-app">
      <header className="cl-topbar">
        <div className="cl-brand">
          <button className="cl-brand-mark" type="button" onClick={() => { setSelectedClassId(null); setPage("classes"); }} aria-label="Go to classrooms">c</button>
          <span>class<span className="cl-brand-light">lens</span></span>
        </div>
        <div className="cl-topbar-title">{headerTitle}</div>
        <div className="cl-topbar-actions">
          {demoMode && <span className="cl-demo-pill"><span /> Local demo</span>}
          <button className={`cl-icon-button cl-notification-button ${page === "notifications" ? "is-active" : ""}`} type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} onClick={() => { setPage("notifications"); setSelectedClassId(null); }}>
            ♧{unreadCount > 0 && <span className="cl-notification-count">{unreadCount}</span>}
          </button>
          {demoMode ? <button className="cl-user-switch" type="button" onClick={() => {
            const nextUser = user.role === "student" ? demoTeacher : demoStudent;
            setUser(nextUser);
            onUserChange?.(nextUser);
            setTab("stream");
          }} title="Switch demo role">
            <Avatar person={user} /><span className="cl-user-name">{user.name}</span><span className="cl-user-chevron">⌄</span>
          </button> : <div className="cl-user-switch"><Avatar person={user} /><span className="cl-user-name">{user.name}</span></div>}
        </div>
      </header>

      <div className="cl-layout">
        <aside className="cl-sidebar">
          {onHome && <button className="cl-nav-item" type="button" onClick={onHome}>
            <span aria-hidden="true">⌂</span><span>Overview</span>
          </button>}
          <button className={`cl-nav-item ${page === "classes" ? "is-active" : ""}`} type="button" onClick={() => { setPage("classes"); setSelectedClassId(null); }}>
            <span aria-hidden="true">▦</span><span>Classrooms</span>
          </button>
          <button className={`cl-nav-item ${page === "notifications" ? "is-active" : ""}`} type="button" onClick={() => { setPage("notifications"); setSelectedClassId(null); }}>
            <span aria-hidden="true">♧</span><span>Notifications</span>{unreadCount > 0 && <span className="cl-nav-count">{unreadCount}</span>}
          </button>
          <div className="cl-sidebar-divider" />
          <div className="cl-sidebar-label">Enrolled</div>
          {classes.map((classroom) => (
            <button className={`cl-class-nav ${selectedClassId === classroom.id ? "is-active" : ""}`} type="button" key={classroom.id} onClick={() => openClass(classroom)}>
              <span className="cl-class-nav-mark" style={{ backgroundColor: classroom.color }}>{classroom.subject.slice(0, 1)}</span>
              <span className="cl-class-nav-copy"><strong>{classroom.name}</strong><small>{classroom.section}</small></span>
            </button>
          ))}
          <div className="cl-sidebar-bottom">
            <span className="cl-sidebar-bottom-icon">✳</span>
            <span><strong>Learning together</strong><small>One class at a time.</small></span>
          </div>
        </aside>

        <main className="cl-main">
          {page === "notifications" ? (
            <section className="cl-page-wrap cl-notifications-page">
              <div className="cl-page-heading"><div><span className="cl-eyebrow">STAY IN THE LOOP</span><h1>Notifications</h1><p>Recent updates from your classrooms.</p></div>
                {unreadCount > 0 && <button className="cl-button cl-button-quiet" type="button" onClick={() => notifications.filter((entry) => !entry.read).forEach((entry) => markRead(entry.id))}>Mark all read</button>}
              </div>
              <NotificationsView notifications={notifications} classNames={classNames} onOpen={openNotification} onMarkRead={markRead} />
            </section>
          ) : selectedClass ? (
            <section className="cl-class-page">
              <ClassBanner classroom={selectedClass} onBack={() => setSelectedClassId(null)} />
              <nav className="cl-tabs" aria-label="Class sections">
                {([
                  ["stream", "Stream"],
                  ["classwork", "Classwork"],
                  ["people", "People"],
                  ...(user.role === "teacher" ? [["grades", "Grades"] as [ClassroomTab, string]] : []),
                  ["settings", "Settings"],
                ] as [ClassroomTab, string][]).map(([key, label]) => (
                  <button className={tab === key ? "is-active" : ""} type="button" key={key} onClick={() => setTab(key)}>{label}</button>
                ))}
              </nav>
              <div className="cl-class-content">
                {tab === "stream" && <StreamView
                  classroom={selectedClass}
                  role={user.role}
                  onCompose={() => setShowAnnouncementComposer(true)}
                  onViewClasswork={() => setTab("classwork")}
                  onComment={setCommentTarget}
                  onOpenWork={setSelectedWork}
                />}
                {tab === "classwork" && <ClassworkView
                  classroom={selectedClass}
                  role={user.role}
                  userId={user.id}
                  onAdd={() => setShowWorkComposer(true)}
                  onOpen={setSelectedWork}
                />}
                {tab === "people" && <PeopleView classroom={selectedClass} />}
                {tab === "grades" && user.role === "teacher" && <GradesView classroom={selectedClass} onReview={(item, student) => setReviewTarget({ item, student })} />}
                {tab === "settings" && <SettingsView
                  classroom={selectedClass}
                  copied={copiedCode}
                  onCopyCode={() => {
                    const copied = () => {
                      setCopiedCode(true);
                      window.setTimeout(() => setCopiedCode(false), 1800);
                      notify("Class code copied");
                    };
                    if (navigator.clipboard) void navigator.clipboard.writeText(selectedClass.code).then(copied).catch(() => notify(`Class code: ${selectedClass.code}`));
                    else notify(`Class code: ${selectedClass.code}`);
                  }}
                  onToggleNotifications={() => updateClass(selectedClass.id, (classroom) => ({ ...classroom, notificationsEnabled: !classroom.notificationsEnabled }))}
                />}
              </div>
            </section>
          ) : (
            <section className="cl-page-wrap">
              <div className="cl-page-heading">
                <div><span className="cl-eyebrow">YOUR LEARNING SPACE</span><h1>Your classrooms</h1><p>Pick up where you left off or explore a class.</p></div>
                <span className="cl-class-total">{classes.length} classrooms <span>·</span> {user.role === "student" ? "Student view" : "Teacher view"}</span>
              </div>
              <label className="cl-search">
                <span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a classroom" aria-label="Find a classroom" />
                <kbd>⌘ K</kbd>
              </label>
              {filteredClasses.length ? <div className="cl-class-grid">{filteredClasses.map((classroom) => <ClassCard key={classroom.id} classroom={classroom} onSelect={() => openClass(classroom)} />)}</div> :
                <EmptyState icon="⌕" title="No classrooms found" detail="Try searching with a different name or subject." />}
              <div className="cl-home-note"><span>✦</span><span><strong>Every class begins with a question.</strong> Keep exploring and stay curious.</span></div>
            </section>
          )}
        </main>
      </div>

      {showWorkComposer && selectedClass && <WorkComposer onClose={() => setShowWorkComposer(false)} onSubmit={addWork} />}
      {showAnnouncementComposer && selectedClass && <AnnouncementComposer onClose={() => setShowAnnouncementComposer(false)} onSubmit={addAnnouncement} />}
      {commentTarget && <CommentDialog announcement={commentTarget} currentUser={user} onClose={() => setCommentTarget(null)} onSubmit={addComment} />}
      {selectedWork && selectedClass && <WorkDetailDialog
        item={selectedWork}
        classroom={selectedClass}
        user={user}
        onClose={() => setSelectedWork(null)}
        onSaveSubmission={(submission) => { if (saveSubmission(submission)) { setSelectedWork(null); notify("Your work was turned in"); } }}
      />}
      {reviewTarget && selectedClass && <ReviewDialog
        item={reviewTarget.item}
        student={reviewTarget.student}
        submission={selectedClass.submissions.find((entry) => entry.itemId === reviewTarget.item.id && entry.studentId === reviewTarget.student.id)}
        onClose={() => setReviewTarget(null)}
        onSave={(submission) => { if (saveSubmission(submission)) { setReviewTarget(null); notify("Feedback returned to student"); } }}
      />}
      {toast && <div className="cl-toast" role="status">{toast}</div>}
    </div>
  );
}

function StreamView({
  classroom,
  role,
  onCompose,
  onViewClasswork,
  onComment,
  onOpenWork,
}: {
  classroom: Classroom;
  role: "teacher" | "student";
  onCompose: () => void;
  onViewClasswork: () => void;
  onComment: (announcement: Announcement) => void;
  onOpenWork: (item: ClassworkItem) => void;
}) {
  const upcoming = classroom.classwork.filter((item) => item.dueAt && item.type !== "material").sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || "")).slice(0, 3);
  return (
    <div className="cl-stream-layout">
      <aside className="cl-stream-aside">
        <section className="cl-panel cl-upcoming-panel">
          <div className="cl-aside-title"><strong>Upcoming</strong><span>›</span></div>
          {upcoming.length ? upcoming.map((item) => (
            <button type="button" className="cl-upcoming-item" key={item.id} onClick={() => onOpenWork(item)}>
              <span>{item.title}</span><small>Due {formatDate(item.dueAt as string)}</small>
            </button>
          )) : <p className="cl-muted">Nothing due soon.</p>}
          <button type="button" className="cl-text-button" onClick={onViewClasswork}>View all classwork →</button>
        </section>
        <section className="cl-panel cl-class-info">
          <span className="cl-aside-overline">ABOUT THIS CLASS</span>
          <p>{classroom.description}</p>
          <span className="cl-info-row">⌖ {classroom.room}</span>
          <span className="cl-info-row">♙ {classroom.students.length + 1} people</span>
        </section>
      </aside>
      <div className="cl-stream-feed">
        {role === "teacher" && <button className="cl-panel cl-compose-prompt" type="button" onClick={onCompose}>
          <Avatar person={classroom.teacher} />
          <span>Share something with your class...</span>
          <span className="cl-compose-plus">＋</span>
        </button>}
        {classroom.announcements.length ? classroom.announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} onComment={() => onComment(announcement)} />) :
          <EmptyState icon="✳" title="Your stream starts here" detail="Share an update or announcement with your class." action={role === "teacher" ? <button type="button" className="cl-button cl-button-primary" onClick={onCompose}>Post an announcement</button> : undefined} />}
      </div>
    </div>
  );
}

function ClassworkView({
  classroom,
  role,
  userId,
  onAdd,
  onOpen,
}: {
  classroom: Classroom;
  role: "teacher" | "student";
  userId: string;
  onAdd: () => void;
  onOpen: (item: ClassworkItem) => void;
}) {
  const topics = new Map<string, ClassworkItem[]>();
  classroom.classwork.forEach((item) => {
    const topic = item.topic || "No topic";
    topics.set(topic, [...(topics.get(topic) || []), item]);
  });
  return (
    <div className="cl-classwork-view">
      <div className="cl-classwork-heading">
        <div><span className="cl-eyebrow">RESOURCES & ACTIVITIES</span><h2>Classwork</h2><p>Assignments, practice, and resources for this class.</p></div>
        {role === "teacher" && <button className="cl-button cl-button-primary" type="button" onClick={onAdd}>＋ Create</button>}
      </div>
      {topics.size ? Array.from(topics.entries()).map(([topic, items]) => (
        <section className="cl-topic-section" key={topic}>
          <h3>{topic}</h3>
          <div className="cl-topic-list">{items.map((item) => (
            <ClassworkCard key={item.id} item={item} role={role} submission={classroom.submissions.find((entry) => entry.itemId === item.id && entry.studentId === userId)} onOpen={() => onOpen(item)} />
          ))}</div>
        </section>
      )) : <EmptyState icon="▤" title="No classwork posted" detail={role === "teacher" ? "Create an assignment, question, or resource to get started." : "Your teacher's assignments and resources will show up here."} action={role === "teacher" ? <button className="cl-button cl-button-primary" type="button" onClick={onAdd}>＋ Create classwork</button> : undefined} />}
    </div>
  );
}

function Dialog({ title, eyebrow, children, onClose, wide = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="cl-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`cl-dialog ${wide ? "cl-dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="cl-dialog-header">
          <div>{eyebrow && <span className="cl-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
          <button type="button" className="cl-icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </section>
    </div>
  );
}

function AnnouncementComposer({ onClose, onSubmit }: { onClose: () => void; onSubmit: (body: string) => void }) {
  const [body, setBody] = useState("");
  return (
    <Dialog title="Post to your class" eyebrow="ANNOUNCEMENT" onClose={onClose}>
      <form className="cl-form" onSubmit={(event) => { event.preventDefault(); if (body.trim()) onSubmit(body.trim()); }}>
        <label>Message<textarea autoFocus rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share an update, reminder, or question with your class..." required /></label>
        <div className="cl-form-note">Your post will appear in the class stream.</div>
        <div className="cl-dialog-actions"><button type="button" className="cl-button cl-button-quiet" onClick={onClose}>Cancel</button><button className="cl-button cl-button-primary" type="submit" disabled={!body.trim()}>Post</button></div>
      </form>
    </Dialog>
  );
}

function WorkComposer({ onClose, onSubmit }: { onClose: () => void; onSubmit: (values: Pick<ClassworkItem, "type" | "title" | "instructions" | "topic" | "dueAt" | "points" | "attachmentName" | "attachmentSource">) => void }) {
  const [type, setType] = useState<ClassworkType>("assignment");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [topic, setTopic] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [points, setPoints] = useState("100");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentSource, setAttachmentSource] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  return (
    <Dialog title="Create classwork" eyebrow="NEW CLASSWORK" onClose={onClose} wide>
      <form className="cl-form cl-work-form" onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ type, title: title.trim(), instructions: instructions.trim(), topic: topic.trim() || undefined, dueAt: dueAt ? new Date(`${dueAt}T23:59:00`).toISOString() : undefined, points: type === "material" ? undefined : Number(points) || 0, attachmentName: attachmentName || undefined, attachmentSource: attachmentSource || undefined });
      }}>
        <label>Type<select value={type} onChange={(event) => setType(event.target.value as ClassworkType)}><option value="assignment">Assignment</option><option value="quiz">Quiz</option><option value="question">Question</option><option value="material">Material</option></select></label>
        <label>Title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Chapter 4 reading" required /></label>
        <label>Instructions<textarea rows={4} value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Add details for your class..." /></label>
        <div className="cl-form-grid">
          <label>Topic<input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Choose or add a topic" /></label>
          {type !== "material" && <label>Points<input type="number" min="0" value={points} onChange={(event) => setPoints(event.target.value)} /></label>}
          {type !== "material" && <label>Due date<input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>}
        </div>
        <label>Attach a file<input type="file" onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          setAttachmentError("");
          if (!file) {
            setAttachmentName("");
            setAttachmentSource("");
            return;
          }
          if (file.size > 2 * 1024 * 1024) {
            setAttachmentError("Files must be 2 MB or smaller in this local demo.");
            return;
          }
          setAttachmentName(file.name);
          setAttachmentSource("");
          setAttachmentLoading(true);
          void readFileAsDataUrl(file).then(setAttachmentSource).catch(() => {
            setAttachmentName("");
            setAttachmentSource("");
            setAttachmentError("The file could not be read. Try a smaller or different file.");
          }).finally(() => setAttachmentLoading(false));
        }} /></label>
        {attachmentError && <p className="cl-form-error" role="alert">{attachmentError}</p>}
        {attachmentName && <p className="cl-form-note">Attached: {attachmentName}</p>}
        <p className="cl-form-note">Classwork is shown in the class stream and Classwork tab.</p>
        <div className="cl-dialog-actions"><button type="button" className="cl-button cl-button-quiet" onClick={onClose}>Cancel</button><button className="cl-button cl-button-primary" type="submit" disabled={!title.trim() || attachmentLoading || Boolean(attachmentName && !attachmentSource)}>{type === "material" ? "Post material" : type === "question" ? "Ask question" : type === "quiz" ? "Create quiz" : "Assign"}</button></div>
      </form>
    </Dialog>
  );
}

function CommentDialog({ announcement, currentUser, onClose, onSubmit }: { announcement: Announcement; currentUser: ClassroomPerson; onClose: () => void; onSubmit: (body: string) => void }) {
  const [body, setBody] = useState("");
  return (
    <Dialog title="Class comments" eyebrow={announcement.author.name} onClose={onClose}>
      <p className="cl-comment-original">{announcement.body}</p>
      <div className="cl-comment-list">
        {announcement.commentEntries?.map((comment) => <div className="cl-comment-entry" key={comment.id}><Avatar person={comment.author} /><span><strong>{comment.author.name}</strong><small>{comment.body}</small></span></div>)}
        {(!announcement.commentEntries || announcement.commentEntries.length === 0) && <p className="cl-muted">{announcement.comments ? `${announcement.comments} comments` : "No comments yet. Start the conversation."}</p>}
      </div>
      <form className="cl-comment-form" onSubmit={(event) => { event.preventDefault(); if (body.trim()) onSubmit(body.trim()); setBody(""); }}>
        <Avatar person={currentUser} /><input autoFocus value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a class comment..." aria-label="Add a class comment" /><button type="submit" className="cl-icon-button" disabled={!body.trim()} aria-label="Post comment">↑</button>
      </form>
    </Dialog>
  );
}

function WorkDetailDialog({ item, classroom, user, onClose, onSaveSubmission }: {
  item: ClassworkItem;
  classroom: Classroom;
  user: ClassroomPerson;
  onClose: () => void;
  onSaveSubmission: (submission: StudentSubmission) => void;
}) {
  const submission = classroom.submissions.find((entry) => entry.itemId === item.id && entry.studentId === user.id);
  const [response, setResponse] = useState(submission?.response || "");
  const [attachmentName, setAttachmentName] = useState(submission?.attachmentName || "");
  const [attachmentSource, setAttachmentSource] = useState(submission?.attachmentSource || "");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const canSubmit = user.role === "student" && item.type !== "material";
  return (
    <Dialog title={item.title} eyebrow={`${item.type.toUpperCase()}${item.topic ? ` · ${item.topic.toUpperCase()}` : ""}`} onClose={onClose} wide>
      <div className="cl-work-detail">
        <div className="cl-detail-main">
          <p className="cl-detail-instructions">{item.instructions || "No additional instructions."}</p>
          {item.attachmentName && <div className="cl-attachment"><span>▧</span><span><strong>{item.attachmentName}</strong><small>Class resource</small></span>{item.attachmentSource && <a className="cl-attachment-download" href={item.attachmentSource} target="_blank" rel="noreferrer">Open ↗</a>}</div>}
          {canSubmit && <label className="cl-detail-response">Your response<textarea rows={4} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Write your response here..." disabled={submission?.status === "turned-in" || submission?.status === "returned"} /></label>}
          {canSubmit && <label className="cl-detail-response">Attach your work<input type="file" disabled={submission?.status === "turned-in" || submission?.status === "returned"} onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return;
            setAttachmentError("");
            if (file.size > 2 * 1024 * 1024) {
              setAttachmentError("Files must be 2 MB or smaller in this local demo.");
              return;
            }
            setAttachmentName(file.name);
            setAttachmentSource("");
            setAttachmentLoading(true);
            void readFileAsDataUrl(file).then(setAttachmentSource).catch(() => {
              setAttachmentName("");
              setAttachmentSource("");
              setAttachmentError("The file could not be read. Try a smaller or different file.");
            }).finally(() => setAttachmentLoading(false));
          }} />{attachmentName && <small>Attached: {attachmentName}</small>}{attachmentError && <small role="alert">{attachmentError}</small>}</label>}
          {submission?.feedback && <div className="cl-feedback-box"><strong>Feedback from {classroom.teacher.name}</strong><p>{submission.feedback}</p></div>}
        </div>
        <aside className="cl-detail-side">
          {user.role === "student" && item.type !== "material" && <div className="cl-detail-status"><strong>Your work</strong>{submission ? <StatusBadge status={submission.status} /> : <StatusBadge status="assigned" />}</div>}
          {item.type !== "material" && <div className="cl-detail-stat"><small>Due</small><strong>{item.dueAt ? formatDate(item.dueAt) : "No due date"}</strong></div>}
          {item.type !== "material" && <div className="cl-detail-stat"><small>Points</small><strong>{item.points ?? "—"}</strong></div>}
          {submission?.grade !== undefined && <div className="cl-detail-grade"><strong>{submission.grade}</strong> / {item.points ?? "—"} points</div>}
          {canSubmit && <button className="cl-button cl-button-primary cl-submit-button" disabled={(!response.trim() && !attachmentName) || attachmentLoading || (attachmentName && !attachmentSource) || submission?.status === "turned-in" || submission?.status === "returned"} type="button" onClick={() => setConfirm(true)}>
            {submission?.status === "returned" ? "Returned" : submission?.status === "turned-in" ? "Turned in" : "Turn in"}
          </button>}
          {confirm && <div className="cl-confirm-box"><strong>Turn in your work?</strong><p>You can’t edit your response after turning it in.</p><div><button type="button" className="cl-button cl-button-quiet" onClick={() => setConfirm(false)}>Keep editing</button><button type="button" className="cl-button cl-button-primary" onClick={() => onSaveSubmission({ itemId: item.id, studentId: user.id, status: "turned-in", turnedInAt: new Date().toISOString(), response: response.trim(), attachmentName: attachmentName || undefined, attachmentSource: attachmentSource || undefined })}>Confirm</button></div></div>}
        </aside>
      </div>
    </Dialog>
  );
}

function ReviewDialog({ item, student, submission, onClose, onSave }: {
  item: ClassworkItem;
  student: ClassroomPerson;
  submission?: StudentSubmission;
  onClose: () => void;
  onSave: (submission: StudentSubmission) => void;
}) {
  const [grade, setGrade] = useState(submission?.grade === undefined ? "" : String(submission.grade));
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  return (
    <Dialog title={`Review ${student.name.split(" ")[0]}'s work`} eyebrow={item.title} onClose={onClose}>
      <div className="cl-review-response"><div className="cl-review-student"><Avatar person={student} /><span><strong>{student.name}</strong><small>{submission?.turnedInAt ? `Turned in ${formatDate(submission.turnedInAt)}` : "Not turned in yet"}</small></span></div>
        <p>{submission?.response || "No response has been submitted yet."}</p>
        {submission?.attachmentSource && <p><a href={submission.attachmentSource} target="_blank" rel="noreferrer">{submission.attachmentName || "Open submitted attachment"}</a></p>}
      </div>
      <form className="cl-form cl-review-form" onSubmit={(event) => {
        event.preventDefault();
        onSave({ itemId: item.id, studentId: student.id, status: "returned", turnedInAt: submission?.turnedInAt, response: submission?.response, attachmentName: submission?.attachmentName, attachmentSource: submission?.attachmentSource, grade: grade === "" ? undefined : Number(grade), feedback: feedback.trim() || undefined });
      }}>
        <label>Grade <span className="cl-grade-input-wrap"><input type="number" min="0" max={item.points} value={grade} onChange={(event) => setGrade(event.target.value)} /><small>/{item.points ?? "—"} points</small></span></label>
        <label>Private comment<textarea rows={3} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Add feedback for this student..." /></label>
        <div className="cl-dialog-actions"><button type="button" className="cl-button cl-button-quiet" onClick={onClose}>Cancel</button><button className="cl-button cl-button-primary" type="submit">Return</button></div>
      </form>
    </Dialog>
  );
}

function cloneClasses(classes: Classroom[]) {
  return classes.map((classroom) => ({
    ...classroom,
    students: [...classroom.students],
    announcements: classroom.announcements.map((announcement) => ({ ...announcement, commentEntries: [...(announcement.commentEntries || [])] })),
    classwork: [...classroom.classwork],
    submissions: [...classroom.submissions],
  }));
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

async function readFileAsDataUrl(file: File): Promise<string> {
  const claimsPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  let fileToRead: Blob = file;
  if (claimsPdf) {
    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (new TextDecoder().decode(signature) !== "%PDF-") {
      throw new Error("The selected PDF does not have a valid PDF header.");
    }
    fileToRead = new Blob([file], { type: "application/pdf" });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The selected file did not produce a data URL."));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(fileToRead);
  });
}
