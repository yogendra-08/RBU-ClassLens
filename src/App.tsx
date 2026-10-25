import { useEffect, useMemo, useState } from "react";
import "./app.css";
import {
  classLensData,
  DEMO_MODE_NOTICE,
  DEMO_USERS,
  type AnnouncementComment as DataAnnouncementComment,
  type ClassRoom,
  type DataSnapshot,
  type User,
} from "./data";
import {
  ClassroomApp,
  type Announcement,
  type AnnouncementComment,
  type Classroom,
  type ClassroomNotification,
  type ClassroomPerson,
  type ClassworkItem,
  type StudentSubmission,
} from "./features/classroom";
import {
  createLocalStorageNotesActivityStore,
  StudentNoteViewer,
  TeacherNoteViews,
  type TeacherNotesClass,
} from "./features/notes";
import {
  ClassLensShell,
  Dialog,
  Icon,
  StudentDashboard,
  TeacherDashboard,
  type ClassCardData,
  type ClassLensNavItem,
  type DashboardStat,
} from "./ui";
import type { UserRole } from "./data/models";

type AppPage = "overview" | "classes" | "assignments" | "notes" | "notifications" | "settings";

const notesActivityStore = createLocalStorageNotesActivityStore();

const navigation: ClassLensNavItem[] = [
  { id: "overview", label: "Overview", icon: <Icon name="home" /> },
  { id: "classes", label: "My classes", icon: <Icon name="book" /> },
  { id: "assignments", label: "Classwork", icon: <Icon name="task" /> },
  { id: "notes", label: "PDF notes", icon: <Icon name="book" /> },
  { id: "notifications", label: "Notifications", icon: <Icon name="bell" /> },
  { id: "settings", label: "Settings", icon: <Icon name="chart" /> },
];

export default function App() {
  const [snapshot, setSnapshot] = useState<DataSnapshot>(() => classLensData.getSnapshot());
  const [page, setPage] = useState<AppPage>("overview");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [initialClassId, setInitialClassId] = useState<string | undefined>();
  const [initialClassTab, setInitialClassTab] = useState<"stream" | "classwork">("stream");

  useEffect(
    () => classLensData.subscribe((next) => setSnapshot(next)),
    [],
  );

  const user = snapshot.session
    ? snapshot.users.find((candidate) => candidate.id === snapshot.session?.userId)
    : undefined;

  const accessibleClasses = useMemo(() => {
    if (!user) return [];
    return classLensData.getClassesForUser(user.id);
  }, [snapshot, user]);

  const classroomData = useMemo(
    () => accessibleClasses.map((classRoom) => toFeatureClass(classRoom, snapshot)),
    [accessibleClasses, snapshot],
  );

  const classCards = useMemo(
    () => classroomData.map((classRoom, index) => ({
      id: classRoom.id,
      name: classRoom.name,
      subject: classRoom.subject,
      section: classRoom.section,
      teacher: classRoom.teacher.name,
      students: classRoom.students.length,
      nextDue: classRoom.classwork
        .filter((item) => item.dueAt && new Date(item.dueAt) >= new Date())
        .sort((left, right) => (left.dueAt ?? "").localeCompare(right.dueAt ?? ""))[0]?.dueAt
        ? formatDate(classRoom.classwork
          .filter((item) => item.dueAt && new Date(item.dueAt) >= new Date())
          .sort((left, right) => (left.dueAt ?? "").localeCompare(right.dueAt ?? ""))[0].dueAt as string)
        : undefined,
      accent: (["violet", "mint", "amber", "blue"] as const)[index % 4],
    } satisfies ClassCardData)),
    [classroomData],
  );

  const currentNotifications = useMemo(
    () => buildNotifications(snapshot, classroomData),
    [snapshot, classroomData],
  );
  const unreadNotifications = currentNotifications.filter((notification) => !notification.read).length;
  const currentClasswork = classroomData.flatMap((classRoom) =>
    classRoom.classwork.map((item) => ({ classRoom, item })),
  );
  const filteredClasswork = currentClasswork.filter(({ classRoom, item }) =>
    `${item.title} ${item.topic ?? ""} ${classRoom.name}`.toLowerCase().includes(search.toLowerCase()),
  );

  if (!user) {
    return (
      <SignIn
        onSelect={(userId) => {
          runMutation(() => classLensData.signInAsDemoUser(userId), setError);
          setPage("overview");
        }}
      />
    );
  }

  const isTeacher = user.role === "teacher" || user.role === "admin";
  const role: "teacher" | "student" = isTeacher ? "teacher" : "student";
  const pageTitle = navigation.find((item) => item.id === page)?.label ?? "Overview";
  const navItems = navigation.filter((item) => isTeacher || item.id !== "settings");
  const featureUser = toFeaturePerson(user);

  if (page === "classes") {
    return (
      <div className="cl-workspace-page">
        <div className="cl-demo-notice" role="note">{DEMO_MODE_NOTICE}</div>
        <ClassroomApp
          key={user.id}
          classes={classroomData}
          currentUser={featureUser}
          notifications={currentNotifications}
          demoMode
          initialClassId={initialClassId}
          initialTab={initialClassTab}
          onHome={() => {
            setInitialClassId(undefined);
            setPage("overview");
          }}
          onUserChange={(nextUser) => {
            const nextId = DEMO_USERS.find((candidate) => candidate.role === nextUser.role)?.id;
            if (nextId) runMutation(() => classLensData.signInAsDemoUser(nextId), setError);
          }}
          onMutationError={(mutationError) => setError(mutationError.message)}
          onAnnouncementCreate={persistAnnouncement}
          onAnnouncementComment={persistComment}
          onClassworkCreate={persistClasswork}
          onSubmissionUpdate={(submission) => persistSubmission(submission, snapshot)}
          onGradeUpdate={(submission) => persistGrade(submission, snapshot)}
          onClassUpdate={() => undefined}
        />
        {error && <ErrorNotice message={error} onDismiss={() => setError("")} />}
      </div>
    );
  }

  const topNav = navItems.map((item) => ({
    ...item,
    badge: item.id === "notifications" && unreadNotifications ? unreadNotifications : undefined,
  }));

  return (
    <ClassLensShell
      role={role}
      user={{
        name: user.displayName,
        email: user.email,
        initials: initials(user.displayName),
        avatarUrl: user.avatarUrl,
      }}
      activeItem={page}
      navItems={topNav}
      pageTitle={pageTitle}
      notificationCount={unreadNotifications}
      onNavigate={(item) => {
        setError("");
        if (isAppPage(item.id)) setPage(item.id);
      }}
      onSearch={setSearch}
      onNotificationsClick={() => setPage("notifications")}
      onProfile={() => setPage("settings")}
      onSettings={() => setPage("settings")}
      onSignOut={() => {
        classLensData.signOut();
        setPage("overview");
      }}
      headerActions={<span className="cl-demo-mode-pill">LOCAL DEMO</span>}
    >
      {error && <ErrorNotice message={error} onDismiss={() => setError("")} />}
      {page === "overview" && (
        isTeacher ? (
          <TeacherDashboard
            name={user.displayName}
            classes={filterCards(classCards, search)}
            stats={teacherStats(snapshot, accessibleClasses)}
            pendingReviews={pendingReviewCount(snapshot, accessibleClasses)}
            upcomingItems={upcomingFor(classroomData, user.role)}
            onCreateClass={() => setCreateDialogOpen(true)}
            onViewAllClasses={() => setPage("classes")}
            onOpenClass={(classId) => openClass(classId, setInitialClassId, setInitialClassTab, setPage)}
          />
        ) : (
          <StudentDashboard
            name={user.displayName}
            classes={filterCards(classCards, search)}
            stats={studentStats(snapshot, accessibleClasses, classroomData, user.id)}
            upcomingItems={upcomingFor(classroomData, user.role)}
            onCreateClass={() => setJoinDialogOpen(true)}
            onViewAllClasses={() => setPage("classes")}
            onOpenClass={(classId) => openClass(classId, setInitialClassId, setInitialClassTab, setPage)}
          />
        )
      )}
      {page === "assignments" && (
        <section className="cl-content-page">
          <header className="cl-content-heading">
            <div><p className="cl-eyebrow">COURSE WORK</p><h1>Assignments & activities</h1><p>Track your work across every classroom.</p></div>
            <label className="cl-content-search"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter classwork" aria-label="Filter classwork" /></label>
          </header>
          {filteredClasswork.length ? (
            <div className="cl-task-list">
              {filteredClasswork.map(({ classRoom, item }) => (
                <button key={`${classRoom.id}:${item.id}`} className="cl-task-row" type="button" onClick={() => openClass(classRoom.id, setInitialClassId, setInitialClassTab, setPage)}>
                  <span className={`cl-task-type cl-task-type--${item.type}`}><Icon name={item.type === "material" ? "book" : "task"} size={18} /></span>
                  <span className="cl-task-copy"><strong>{item.title}</strong><small>{classRoom.name} · {item.topic ?? item.type}</small></span>
                  <span className="cl-task-due">{item.dueAt ? `Due ${formatDate(item.dueAt)}` : item.type === "material" ? "Study material" : "No due date"}</span>
                  <Icon name="arrow" size={17} />
                </button>
              ))}
            </div>
          ) : <EmptyPanel title="No classwork found" detail="Your assignments and class resources will appear here." />}
        </section>
      )}
      {page === "notes" && (
        <NotesPage
          role={role}
          user={user}
          classes={teacherNoteClasses(snapshot, accessibleClasses)}
          materials={snapshot.materials.filter((material) => accessibleClasses.some((classRoom) => classRoom.id === material.classId) && material.kind === "document")}
          snapshot={snapshot}
        />
      )}
      {page === "notifications" && (
        <section className="cl-content-page">
          <header className="cl-content-heading"><div><p className="cl-eyebrow">STAY IN THE LOOP</p><h1>Notifications</h1><p>Updates from your classrooms. This demo derives them from the saved class stream.</p></div></header>
          {currentNotifications.length ? (
            <div className="cl-task-list">
              {currentNotifications.map((notification) => (
                <button key={notification.id} type="button" className="cl-task-row" onClick={() => openClass(notification.classId, setInitialClassId, setInitialClassTab, setPage)}>
                  <span className="cl-task-type cl-task-type--notice"><Icon name="bell" size={18} /></span>
                  <span className="cl-task-copy"><strong>{notification.title}</strong><small>{notification.detail}</small></span>
                  <span className="cl-task-due">{formatDate(notification.createdAt)}</span>
                  <Icon name="arrow" size={17} />
                </button>
              ))}
            </div>
          ) : <EmptyPanel title="You're all caught up" detail="New class updates will appear here." />}
        </section>
      )}
      {page === "settings" && (
        <SettingsPage
          user={user}
          onReset={() => {
            runMutation(() => classLensData.resetDemoData(), setError);
            setPage("overview");
          }}
        />
      )}
      {createDialogOpen && (
        <CreateClassDialog
          onClose={() => setCreateDialogOpen(false)}
          onCreate={(values) => runMutation(() => {
            classLensData.createClassroom(values);
            setCreateDialogOpen(false);
          }, setError)}
        />
      )}
      {joinDialogOpen && (
        <JoinClassDialog
          onClose={() => setJoinDialogOpen(false)}
          onJoin={(code) => runMutation(() => {
            const classRoom = classLensData.joinClassByCode(code);
            setJoinDialogOpen(false);
            openClass(classRoom.id, setInitialClassId, setInitialClassTab, setPage);
          }, setError)}
        />
      )}
    </ClassLensShell>
  );
}

function SignIn({ onSelect }: { onSelect: (userId: string) => void }) {
  return (
    <main className="cl-login-page">
      <section className="cl-login-card">
        <div className="cl-login-mark" aria-hidden="true">cl</div>
        <p className="cl-eyebrow">RBU LEARNING WORKSPACE</p>
        <h1>Welcome to ClassLens</h1>
        <p>Choose a sample role to explore the local demo. This does not use Google sign-in.</p>
        <div className="cl-login-options">
          {DEMO_USERS.filter((candidate) => candidate.role !== "admin").map((candidate) => (
            <button key={candidate.id} type="button" className="cl-login-option" onClick={() => onSelect(candidate.id)}>
              <span className="cl-login-avatar">{initials(candidate.displayName)}</span>
              <span><strong>{candidate.displayName}</strong><small>{candidate.role === "teacher" ? "Teacher demo" : "Student demo"} · {candidate.email}</small></span>
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
        <p className="cl-demo-notice">{DEMO_MODE_NOTICE}</p>
      </section>
    </main>
  );
}

function NotesPage({
  role,
  user,
  classes,
  materials,
  snapshot,
}: {
  role: "teacher" | "student";
  user: User;
  classes: TeacherNotesClass[];
  materials: DataSnapshot["materials"];
  snapshot: DataSnapshot;
}) {
  if (role === "teacher") {
    return (
      <section className="cl-content-page">
        <header className="cl-content-heading"><div><p className="cl-eyebrow">CLASS MATERIALS</p><h1>PDF note views</h1><p>First-open status for students in classes you teach. No reading percentage is collected.</p></div></header>
        <TeacherNoteViews teacherId={user.id} classes={classes} activityStore={notesActivityStore} />
      </section>
    );
  }

  const studentClasses = snapshot.classes.filter((classRoom) =>
    snapshot.memberships.some((membership) => membership.classId === classRoom.id && membership.userId === user.id && membership.status === "active"),
  );
  const studentMaterials = materials.filter((material) =>
    studentClasses.some((classRoom) => classRoom.id === material.classId),
  );

  return (
    <section className="cl-content-page">
      <header className="cl-content-heading"><div><p className="cl-eyebrow">CLASS MATERIALS</p><h1>PDF notes</h1><p>Open a class PDF here; its first-open date is recorded for your teacher.</p></div></header>
      {studentMaterials.length ? (
        <div className="cl-note-grid">
          {studentMaterials.map((material) => {
            const classRoom = snapshot.classes.find((candidate) => candidate.id === material.classId);
            if (!classRoom) return null;
            return (
              <article className="cl-note-card" key={material.id}>
                <span className="cl-note-card__icon"><Icon name="book" size={22} /></span>
                <div className="cl-note-card__meta"><strong>{material.title}</strong><small>{classRoom.name}</small></div>
                <StudentNoteViewer
                  note={{ id: material.id, title: material.title, classId: classRoom.id, teacherId: classRoom.teacherId }}
                  student={{ id: user.id, displayName: user.displayName }}
                  activityStore={notesActivityStore}
                  samplePdfUrl={material.source.startsWith("data:application/pdf") || (material.source.startsWith("http") && /\.pdf(?:[?#]|$)/i.test(material.source)) ? material.source : undefined}
                  samplePdfLabel={material.fileName ?? "class PDF"}
                />
              </article>
            );
          })}
        </div>
      ) : <EmptyPanel title="No PDF notes shared yet" detail="Your teacher's uploaded PDF notes will appear here." />}
    </section>
  );
}

function CreateClassDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (values: { name: string; courseCode: string; section: string; description: string }) => void }) {
  return (
    <Dialog open title="Create a class" description="Create a local demo classroom and invite students with its class code." onClose={onClose}>
      <form className="cl-form" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onCreate({
          name: String(form.get("name") ?? "").trim(),
          courseCode: String(form.get("courseCode") ?? "").trim(),
          section: String(form.get("section") ?? "").trim(),
          description: String(form.get("description") ?? "").trim(),
        });
      }}>
        <label>Class name<input name="name" required maxLength={100} placeholder="e.g. Intro to Data Science" /></label>
        <div className="cl-form-grid">
          <label>Course code<input name="courseCode" required maxLength={24} placeholder="CSE-210" /></label>
          <label>Section<input name="section" required maxLength={24} placeholder="A" /></label>
        </div>
        <label>Description<textarea name="description" rows={3} maxLength={500} placeholder="What will students learn?" /></label>
        <div className="cl-form-actions"><button className="cl-button cl-button--soft" type="button" onClick={onClose}>Cancel</button><button className="cl-button cl-button--primary" type="submit">Create class</button></div>
      </form>
    </Dialog>
  );
}

function JoinClassDialog({ onClose, onJoin }: { onClose: () => void; onJoin: (code: string) => void }) {
  return (
    <Dialog open title="Join a class" description="Enter a class code shared by your teacher." onClose={onClose}>
      <form className="cl-form" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onJoin(String(form.get("code") ?? "").trim());
      }}>
        <label>Class code<input name="code" required maxLength={32} autoCapitalize="characters" placeholder="CSE304A" /></label>
        <div className="cl-form-actions"><button className="cl-button cl-button--soft" type="button" onClick={onClose}>Cancel</button><button className="cl-button cl-button--primary" type="submit">Join class</button></div>
      </form>
    </Dialog>
  );
}

function SettingsPage({ user, onReset }: { user: User; onReset: () => void }) {
  return (
    <section className="cl-content-page">
      <header className="cl-content-heading"><div><p className="cl-eyebrow">PREFERENCES</p><h1>Account settings</h1><p>Profile details for this browser's demo session.</p></div></header>
      <div className="cl-settings-panels">
        <section className="cl-settings-panel"><h2>Profile</h2><dl><div><dt>Name</dt><dd>{user.displayName}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Role</dt><dd>{user.role}</dd></div></dl></section>
        <section className="cl-settings-panel"><h2>Demo data</h2><p>Changes are saved in this browser only. Reset removes the local demo changes and restores sample classes.</p><button className="cl-button cl-button--soft" type="button" onClick={onReset}>Reset demo data</button></section>
        <p className="cl-demo-notice">{DEMO_MODE_NOTICE}</p>
      </div>
    </section>
  );
}

function ErrorNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="cl-error-notice" role="alert"><span>{message}</span><button type="button" onClick={onDismiss} aria-label="Dismiss error">×</button></div>;
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <div className="cl-empty-state"><span className="cl-empty-state__icon"><Icon name="book" size={23} /></span><h3>{title}</h3><p>{detail}</p></div>;
}

function toFeatureClass(classRoom: ClassRoom, snapshot: DataSnapshot): Classroom {
  const users = new Map(snapshot.users.map((candidate) => [candidate.id, candidate]));
  const teacher = users.get(classRoom.teacherId) ?? fallbackUser(classRoom.teacherId, "Teacher");
  const members = snapshot.memberships.filter((membership) => membership.classId === classRoom.id && membership.status === "active");
  const students = members
    .filter((membership) => membership.role === "student")
    .map((membership) => toFeaturePerson(users.get(membership.userId) ?? fallbackUser(membership.userId, "Student")));
  const announcements = snapshot.announcements
    .filter((announcement) => announcement.classId === classRoom.id)
    .map((announcement) => toFeatureAnnouncement(announcement, snapshot));
  const quizzes = snapshot.quizzes.filter((quiz) => quiz.classId === classRoom.id);
  const questions = (snapshot.classQuestions ?? []).filter((question) => question.classId === classRoom.id);
  const pairedWorkIds = new Set([...quizzes, ...questions].map((item) => item.id));
  const classwork: ClassworkItem[] = [
    ...snapshot.assignments
      .filter((assignment) => assignment.classId === classRoom.id && !pairedWorkIds.has(assignment.id))
      .map((assignment) => ({
        id: assignment.id,
        classId: classRoom.id,
        type: "assignment" as const,
        title: assignment.title,
        instructions: assignment.instructions,
        topic: "Assignments",
        dueAt: assignment.dueAt,
        points: assignment.pointsPossible,
        createdAt: assignment.createdAt,
        author: toFeaturePerson(users.get(assignment.authorId) ?? teacher),
      })),
    ...quizzes.map((quiz) => ({
      id: quiz.id,
      classId: classRoom.id,
      type: "quiz" as const,
      title: quiz.title,
      instructions: quiz.instructions,
      topic: "Quizzes",
      dueAt: quiz.dueAt,
      points: quiz.pointsPossible,
      createdAt: quiz.createdAt,
      author: toFeaturePerson(users.get(quiz.authorId) ?? teacher),
    })),
    ...questions.map((question) => ({
      id: question.id,
      classId: classRoom.id,
      type: "question" as const,
      title: question.prompt,
      instructions: question.prompt,
      topic: "Questions",
      dueAt: question.dueAt,
      points: question.points,
      createdAt: question.createdAt,
      author: toFeaturePerson(users.get(question.authorId) ?? teacher),
    })),
    ...snapshot.materials
      .filter((material) => material.classId === classRoom.id)
      .map((material) => ({
        id: material.id,
        classId: classRoom.id,
        type: "material" as const,
        title: material.title,
        instructions: material.description ?? "",
        topic: "Materials",
        createdAt: material.createdAt,
        author: toFeaturePerson(users.get(material.authorId) ?? teacher),
        attachmentName: material.fileName ?? (material.source.startsWith("data:") ? "Class file" : undefined),
        attachmentSource: material.source.startsWith("data:") || material.source.startsWith("http") ? material.source : undefined,
      })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const submissions: StudentSubmission[] = snapshot.submissions
    .filter((submission) => classwork.some((item) => item.id === submission.assignmentId && item.type !== "material"))
    .map((submission) => {
      const grade = snapshot.grades.find((candidate) => candidate.submissionId === submission.id);
      const feedback = snapshot.feedback.find((candidate) => candidate.submissionId === submission.id);
      return {
        itemId: submission.assignmentId,
        studentId: submission.studentId,
        status: grade || feedback || submission.status === "returned" ? "returned" : submission.status === "submitted" ? "turned-in" : "assigned",
        turnedInAt: submission.submittedAt,
        grade: grade?.pointsEarned,
        feedback: feedback?.body,
        response: submission.text,
        attachmentName: submission.attachmentSources[0]?.startsWith("data:") ? "Submitted attachment" : submission.attachmentSources[0],
        attachmentSource: submission.attachmentSources[0]?.startsWith("data:") ? submission.attachmentSources[0] : undefined,
      };
    });

  const colorPalette = ["#536fb4", "#4b8e78", "#b77b51", "#7868ae"];
  const roomCode = classRoom.courseCode || "RBU";
  return {
    id: classRoom.id,
    name: classRoom.name,
    section: classRoom.section,
    subject: classRoom.courseCode,
    room: `RBU · Section ${classRoom.section}`,
    code: classRoom.classCode ?? roomCode,
    description: classRoom.description,
    color: colorPalette[Math.abs(classRoom.id.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0)) % colorPalette.length],
    teacher: toFeaturePerson(teacher, "teacher"),
    students,
    announcements,
    classwork,
    submissions,
    notificationsEnabled: true,
  };
}

function toFeatureAnnouncement(
  announcement: DataSnapshot["announcements"][number],
  snapshot: DataSnapshot,
): Announcement {
  const author = snapshot.users.find((user) => user.id === announcement.authorId);
  const comments = (snapshot.announcementComments ?? []).filter((comment) => comment.announcementId === announcement.id);
  return {
    id: announcement.id,
    classId: announcement.classId,
    author: toFeaturePerson(author ?? fallbackUser(announcement.authorId, "Teacher")),
    body: [announcement.title, announcement.body].filter(Boolean).join("\n\n"),
    createdAt: announcement.createdAt,
    comments: comments.length,
    commentEntries: comments.map((comment) => toFeatureComment(comment, snapshot)),
  };
}

function toFeatureComment(comment: DataAnnouncementComment, snapshot: DataSnapshot): AnnouncementComment {
  const author = snapshot.users.find((user) => user.id === comment.authorId);
  return {
    id: comment.id,
    announcementId: comment.announcementId,
    author: toFeaturePerson(author ?? fallbackUser(comment.authorId, "Student")),
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

function toFeaturePerson(user: User, role?: "teacher" | "student"): ClassroomPerson {
  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    role: role ?? (user.role === "student" ? "student" : "teacher"),
    initials: initials(user.displayName),
  };
}

function fallbackUser(id: string, displayName: string): User {
  return { id, displayName, email: "", role: "student" };
}

function teacherNoteClasses(snapshot: DataSnapshot, allowedClasses: ClassRoom[]): TeacherNotesClass[] {
  const users = new Map(snapshot.users.map((candidate) => [candidate.id, candidate]));
  return allowedClasses
    .filter((classRoom) => classRoom.teacherId === classLensData.getCurrentUser()?.id)
    .map((classRoom) => ({
      id: classRoom.id,
      name: classRoom.name,
      teacherId: classRoom.teacherId,
      notes: snapshot.materials
        .filter((material) => material.classId === classRoom.id && material.kind === "document")
        .map((material) => ({ id: material.id, title: material.title })),
      students: snapshot.memberships
        .filter((membership) => membership.classId === classRoom.id && membership.role === "student" && membership.status === "active")
        .map((membership) => users.get(membership.userId))
        .filter((student): student is User => Boolean(student))
        .map((student) => ({ id: student.id, displayName: student.displayName })),
    }));
}

function buildNotifications(snapshot: DataSnapshot, classrooms: Classroom[]): ClassroomNotification[] {
  return snapshot.announcements
    .filter((announcement) => classrooms.some((classRoom) => classRoom.id === announcement.classId))
    .slice(0, 8)
    .map((announcement) => ({
      id: `announcement:${announcement.id}`,
      classId: announcement.classId,
      title: "Class announcement",
      detail: announcement.title || announcement.body,
      createdAt: announcement.createdAt,
      read: false,
    }));
}

function teacherStats(snapshot: DataSnapshot, classes: ClassRoom[]): DashboardStat[] {
  const studentIds = new Set(snapshot.memberships
    .filter((membership) => classes.some((classRoom) => classRoom.id === membership.classId) && membership.role === "student" && membership.status === "active")
    .map((membership) => membership.userId));
  return [
    { label: "Active classes", value: classes.length, detail: "Your teaching space", tone: "violet", icon: <Icon name="book" /> },
    { label: "Total students", value: studentIds.size, detail: "Across your classes", tone: "mint", icon: <Icon name="people" /> },
    { label: "To review", value: pendingReviewCount(snapshot, classes), detail: "Submitted work", tone: "amber", icon: <Icon name="task" /> },
  ];
}

function studentStats(snapshot: DataSnapshot, classes: ClassRoom[], classroomData: Classroom[], userId: string): DashboardStat[] {
  const classwork = classroomData.flatMap((classRoom) => classRoom.classwork.filter((item) => item.type !== "material"));
  const completedIds = new Set(snapshot.submissions.filter((submission) => submission.studentId === userId).map((submission) => submission.assignmentId));
  const now = new Date();
  const dueThisWeek = classwork.filter((item) => item.dueAt && new Date(item.dueAt) >= now && new Date(item.dueAt).getTime() < now.getTime() + 7 * 24 * 60 * 60 * 1000 && !completedIds.has(item.id)).length;
  const grades = snapshot.grades.filter((grade) => {
    const submission = snapshot.submissions.find((candidate) => candidate.id === grade.submissionId);
    return submission?.studentId === userId;
  });
  const earned = grades.reduce((total, grade) => total + grade.pointsEarned, 0);
  const possible = grades.reduce((total, grade) => total + grade.pointsPossible, 0);
  return [
    { label: "Enrolled classes", value: classes.length, detail: "Your current classes", tone: "violet", icon: <Icon name="book" /> },
    { label: "Due this week", value: dueThisWeek, detail: "Outstanding classwork", tone: "amber", icon: <Icon name="calendar" /> },
    { label: "Graded work", value: possible ? `${Math.round((earned / possible) * 100)}%` : "—", detail: "Based on returned work", tone: "mint", icon: <Icon name="chart" /> },
  ];
}

function pendingReviewCount(snapshot: DataSnapshot, classes: ClassRoom[]): number {
  const classIds = new Set(classes.map((classRoom) => classRoom.id));
  return snapshot.submissions.filter((submission) => {
    const assignment = snapshot.assignments.find((candidate) => candidate.id === submission.assignmentId);
    return assignment && classIds.has(assignment.classId) && submission.status === "submitted" && !snapshot.grades.some((grade) => grade.submissionId === submission.id);
  }).length;
}

function upcomingFor(classrooms: Classroom[], role: UserRole): Array<{ id: string; title: string; className: string; due: string }> {
  const now = Date.now();
  return classrooms
    .flatMap((classRoom) => classRoom.classwork
      .filter((item) => item.type !== "material" && item.dueAt && new Date(item.dueAt).getTime() >= now)
      .map((item) => ({ id: item.id, title: item.title, className: classRoom.name, due: formatDate(item.dueAt as string) })))
    .slice(0, role === "teacher" ? 4 : 5);
}

function filterCards(cards: ClassCardData[], query: string): ClassCardData[] {
  return cards.filter((card) => `${card.name} ${card.subject} ${card.section ?? ""}`.toLowerCase().includes(query.toLowerCase()));
}

function openClass(
  classId: string,
  setClassId: (value: string) => void,
  setClassTab: (value: "stream" | "classwork") => void,
  setPage: (value: AppPage) => void,
) {
  setClassId(classId);
  setClassTab("classwork");
  setPage("classes");
}

function persistAnnouncement(announcement: Announcement) {
  classLensData.createAnnouncement({
    id: announcement.id,
    classId: announcement.classId,
    title: "Class update",
    body: announcement.body,
    pinned: false,
  });
}

function persistComment(comment: AnnouncementComment) {
  classLensData.addAnnouncementComment(comment.announcementId, comment.body);
}

function persistClasswork(item: ClassworkItem) {
  if (item.type === "material") {
    const kind = item.attachmentName?.toLowerCase().endsWith(".pdf")
      ? "document"
      : item.attachmentName?.match(/\.(png|jpe?g|gif|webp)$/i)
        ? "image"
        : item.attachmentSource?.startsWith("http")
          ? "link"
          : "other";
    classLensData.createMaterial({
      id: item.id,
      classId: item.classId,
      title: item.title,
      description: item.instructions,
      kind,
      source: item.attachmentSource ?? item.attachmentName ?? "",
      fileName: item.attachmentName,
    });
    return;
  }

  const pointsPossible = Math.max(1, item.points ?? 1);
  if (item.type === "quiz") {
    classLensData.createQuiz({
      id: item.id,
      classId: item.classId,
      title: item.title,
      instructions: item.instructions,
      pointsPossible,
      dueAt: item.dueAt,
      status: "published",
    }, [{
      type: "short-answer",
      prompt: item.instructions || item.title,
      points: pointsPossible,
    }]);
    return;
  }

  if (item.type === "question") {
    classLensData.createClassQuestion({
      id: item.id,
      classId: item.classId,
      prompt: item.instructions || item.title,
      points: pointsPossible,
      dueAt: item.dueAt,
    });
    return;
  }

  classLensData.createAssignment({
    id: item.id,
    classId: item.classId,
    title: item.title,
    instructions: item.instructions,
    pointsPossible,
    dueAt: item.dueAt,
    status: "published",
  });
}

function persistSubmission(submission: StudentSubmission, snapshot: DataSnapshot) {
  if (submission.studentId !== classLensData.getCurrentUser()?.id) {
    throw new Error("The active demo student does not match this submission.");
  }
  if (!snapshot.assignments.some((assignment) => assignment.id === submission.itemId)) {
    throw new Error("The classwork item could not be found in the local data store.");
  }
  classLensData.submitAssignment({
    assignmentId: submission.itemId,
    text: submission.response,
    attachmentSources: submission.attachmentSource ? [submission.attachmentSource] : submission.attachmentName ? [submission.attachmentName] : [],
    status: "submitted",
  });
}

function persistGrade(submission: StudentSubmission, snapshot: DataSnapshot) {
  const existing = snapshot.submissions.find((candidate) => candidate.assignmentId === submission.itemId && candidate.studentId === submission.studentId);
  const assignment = snapshot.assignments.find((candidate) => candidate.id === submission.itemId);
  if (!existing || !assignment) {
    throw new Error("This student's submission could not be found.");
  }
  classLensData.returnSubmission(existing.id, {
    grade: submission.grade === undefined
      ? undefined
      : { pointsEarned: submission.grade, pointsPossible: assignment.pointsPossible },
    feedback: submission.feedback,
  });
}

function runMutation(action: () => unknown, setError: (message: string) => void) {
  try {
    action();
    setError("");
  } catch (error) {
    setError(error instanceof Error ? error.message : "The change could not be saved.");
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
}

function isAppPage(value: string): value is AppPage {
  return navigation.some((item) => item.id === value);
}
