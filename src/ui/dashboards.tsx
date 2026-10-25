import type { ReactNode } from "react";
import { Icon } from "./primitives";

export interface DashboardStat {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "violet" | "mint" | "amber" | "blue";
  icon?: ReactNode;
}

export interface ClassCardData {
  id: string;
  name: string;
  subject: string;
  section?: string;
  teacher?: string;
  students?: number;
  nextDue?: string;
  accent?: "violet" | "mint" | "amber" | "blue";
  onOpen?: () => void;
}

interface DashboardBaseProps {
  name: string;
  stats?: DashboardStat[];
  classes?: ClassCardData[];
  onCreateClass?: () => void;
  onViewAllClasses?: () => void;
  onOpenClass?: (classId: string) => void;
}

export interface TeacherDashboardProps extends DashboardBaseProps {
  pendingReviews?: number;
  upcomingItems?: Array<{ id: string; title: string; className: string; due: string }>;
}

export interface StudentDashboardProps extends DashboardBaseProps {
  upcomingItems?: Array<{ id: string; title: string; className: string; due: string }>;
}

const defaultTeacherStats: DashboardStat[] = [
  { label: "Active classes", value: 4, detail: "Across this semester", tone: "violet", icon: <Icon name="book" /> },
  { label: "Total students", value: 128, detail: "In all your classes", tone: "mint", icon: <Icon name="people" /> },
  { label: "To review", value: 12, detail: "Submissions waiting", tone: "amber", icon: <Icon name="task" /> },
];

const defaultStudentStats: DashboardStat[] = [
  { label: "Enrolled classes", value: 5, detail: "This semester", tone: "violet", icon: <Icon name="book" /> },
  { label: "Due this week", value: 3, detail: "Keep up the momentum", tone: "amber", icon: <Icon name="calendar" /> },
  { label: "On-time rate", value: "96%", detail: "You're doing great", tone: "mint", icon: <Icon name="chart" /> },
];

export function TeacherDashboard({
  name,
  stats = defaultTeacherStats,
  classes = [],
  pendingReviews,
  upcomingItems = [],
  onCreateClass,
  onViewAllClasses,
  onOpenClass,
}: TeacherDashboardProps) {
  return (
    <DashboardFrame
      eyebrow="TEACHER OVERVIEW"
      title={`Welcome back, ${firstName(name)}`}
      subtitle="Here's what's happening across your classrooms today."
      stats={stats}
      classes={classes}
      upcomingItems={upcomingItems}
      onCreateClass={onCreateClass}
      onViewAllClasses={onViewAllClasses}
      onOpenClass={onOpenClass}
      classActionLabel="Create class"
      reviewCount={pendingReviews}
    />
  );
}

export function StudentDashboard({
  name,
  stats = defaultStudentStats,
  classes = [],
  upcomingItems = [],
  onCreateClass,
  onViewAllClasses,
  onOpenClass,
}: StudentDashboardProps) {
  return (
    <DashboardFrame
      eyebrow="STUDENT OVERVIEW"
      title={`Good to see you, ${firstName(name)}`}
      subtitle="Pick up where you left off and stay on top of your learning."
      stats={stats}
      classes={classes}
      upcomingItems={upcomingItems}
      onCreateClass={onCreateClass}
      onViewAllClasses={onViewAllClasses}
      onOpenClass={onOpenClass}
      classActionLabel="Join a class"
    />
  );
}

function DashboardFrame({
  eyebrow,
  title,
  subtitle,
  stats,
  classes,
  upcomingItems,
  onCreateClass,
  onViewAllClasses,
  onOpenClass,
  classActionLabel,
  reviewCount,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: DashboardStat[];
  classes: ClassCardData[];
  upcomingItems: NonNullable<TeacherDashboardProps["upcomingItems"]>;
  onCreateClass?: () => void;
  onViewAllClasses?: () => void;
  onOpenClass?: (classId: string) => void;
  classActionLabel: string;
  reviewCount?: number;
}) {
  return (
    <div className="cl-dashboard">
      <section className="cl-welcome">
        <div>
          <p className="cl-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="cl-welcome__subtitle">{subtitle}</p>
        </div>
        <div className="cl-welcome__art" aria-hidden="true">
          <span className="cl-welcome__orb cl-welcome__orb--one" />
          <span className="cl-welcome__orb cl-welcome__orb--two" />
          <span className="cl-welcome__book">
            <Icon name="book" size={36} />
          </span>
        </div>
      </section>

      <section className="cl-stat-grid" aria-label="At a glance">
        {stats.map((stat) => (
          <article className="cl-stat-card" key={stat.label}>
            <div className={`cl-stat-card__icon cl-tone--${stat.tone ?? "violet"}`}>
              {stat.icon ?? <Icon name="chart" />}
            </div>
            <div className="cl-stat-card__value">{stat.value}</div>
            <h2>{stat.label}</h2>
            {stat.detail && <p>{stat.detail}</p>}
          </article>
        ))}
      </section>

      <div className="cl-dashboard__columns">
        <section className="cl-panel cl-classes-panel" aria-labelledby="classes-heading">
          <header className="cl-panel__header">
            <div>
              <p className="cl-eyebrow">YOUR LEARNING SPACE</p>
              <h2 id="classes-heading">Your classes</h2>
            </div>
            <div className="cl-panel__actions">
              {onCreateClass && (
                <button className="cl-button cl-button--soft" type="button" onClick={onCreateClass}>
                  <Icon name="plus" size={17} />
                  {classActionLabel}
                </button>
              )}
              {classes.length > 0 && onViewAllClasses && (
                <button className="cl-link-button" type="button" onClick={onViewAllClasses}>
                  View all <Icon name="arrow" size={16} />
                </button>
              )}
            </div>
          </header>
          {classes.length ? (
            <div className="cl-class-grid">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpen={() => {
                    if (onOpenClass) onOpenClass(classItem.id);
                    else classItem.onOpen?.();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="cl-empty-state">
              <span className="cl-empty-state__icon"><Icon name="book" size={23} /></span>
              <h3>No classes yet</h3>
              <p>Your classes will appear here once they're ready.</p>
              {onCreateClass && (
                <button className="cl-button cl-button--primary" type="button" onClick={onCreateClass}>
                  <Icon name="plus" size={17} /> {classActionLabel}
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="cl-panel cl-agenda-panel" aria-labelledby="agenda-heading">
          <header className="cl-panel__header">
            <div>
              <p className="cl-eyebrow">UP NEXT</p>
              <h2 id="agenda-heading">Your agenda</h2>
            </div>
            <span className="cl-agenda-panel__date"><Icon name="calendar" size={16} /> This week</span>
          </header>
          {reviewCount !== undefined && (
            <div className="cl-review-callout">
              <span className="cl-review-callout__icon"><Icon name="task" /></span>
              <p><strong>{reviewCount} submissions</strong><br />are waiting for your review</p>
              <Icon name="arrow" size={17} />
            </div>
          )}
          {upcomingItems.length ? (
            <ul className="cl-agenda-list">
              {upcomingItems.map((item) => (
                <li className="cl-agenda-item" key={item.id}>
                  <span className="cl-agenda-item__marker" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.className}</p>
                    <span><Icon name="clock" size={14} /> {item.due}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cl-agenda-empty">
              <span><Icon name="calendar" size={21} /></span>
              <p>Nothing due right now. Enjoy the breathing room.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ClassCard({
  classItem,
  onOpen,
}: {
  classItem: ClassCardData;
  onOpen: () => void;
}) {
  const tone = classItem.accent ?? "violet";
  return (
    <article className={`cl-class-card cl-class-card--${tone}`}>
      <button className="cl-class-card__open" type="button" onClick={onOpen} aria-label={`Open ${classItem.name}`}>
        <span className="cl-class-card__art" aria-hidden="true">
          <span className="cl-class-card__shape cl-class-card__shape--one" />
          <span className="cl-class-card__shape cl-class-card__shape--two" />
          <span className="cl-class-card__course-icon"><Icon name="book" size={22} /></span>
        </span>
        <span className="cl-class-card__content">
          <span className="cl-class-card__subject">{classItem.subject}{classItem.section ? ` · ${classItem.section}` : ""}</span>
          <strong>{classItem.name}</strong>
          {classItem.teacher && <span className="cl-class-card__teacher">{classItem.teacher}</span>}
          {classItem.nextDue && (
            <span className="cl-class-card__due"><Icon name="clock" size={14} /> Next: {classItem.nextDue}</span>
          )}
          {classItem.students !== undefined && (
            <span className="cl-class-card__students"><Icon name="people" size={15} /> {classItem.students} students</span>
          )}
        </span>
        <span className="cl-class-card__arrow"><Icon name="arrow" size={17} /></span>
      </button>
    </article>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}
