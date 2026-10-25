import { useState, type ReactNode } from "react";
import { ActionMenu, Icon } from "./primitives";

export type ClassLensRole = "teacher" | "student";

export interface ClassLensUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface ClassLensNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface ClassLensShellProps {
  role: ClassLensRole;
  user: ClassLensUser;
  activeItem?: string;
  navItems?: ClassLensNavItem[];
  children: ReactNode;
  onNavigate?: (item: ClassLensNavItem) => void;
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onProfile?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
  headerActions?: ReactNode;
  pageTitle?: string;
}

const teacherNavigation: ClassLensNavItem[] = [
  { id: "overview", label: "Overview", icon: <Icon name="home" /> },
  { id: "classes", label: "My classes", icon: <Icon name="book" /> },
  { id: "assignments", label: "Assignments", icon: <Icon name="task" />, badge: "4" },
  { id: "students", label: "Students", icon: <Icon name="people" /> },
  { id: "insights", label: "Insights", icon: <Icon name="chart" /> },
];

const studentNavigation: ClassLensNavItem[] = [
  { id: "overview", label: "Overview", icon: <Icon name="home" /> },
  { id: "classes", label: "My classes", icon: <Icon name="book" /> },
  { id: "assignments", label: "Assignments", icon: <Icon name="task" />, badge: "3" },
  { id: "grades", label: "Grades", icon: <Icon name="chart" /> },
];

export function ClassLensShell({
  role,
  user,
  activeItem = "overview",
  navItems = role === "teacher" ? teacherNavigation : studentNavigation,
  children,
  onNavigate,
  onSearch,
  onNotificationsClick,
  notificationCount = 0,
  onProfile,
  onSettings,
  onSignOut,
  headerActions,
  pageTitle,
}: ClassLensShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user.initials || user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const menuItems = [
    ...(onProfile ? [{ label: "View profile", onSelect: onProfile }] : []),
    ...(onSettings ? [{ label: "Settings", onSelect: onSettings }] : []),
    ...(onSignOut ? [{ label: "Sign out", onSelect: onSignOut, destructive: true }] : []),
  ];

  return (
    <div className="cl-app-shell">
      <a className="cl-skip-link" href="#main-content">Skip to main content</a>
      {sidebarOpen && (
        <button
          className="cl-sidebar-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`cl-sidebar${sidebarOpen ? " cl-sidebar--open" : ""}`} aria-label="Main navigation">
        <a className="cl-brand" href="#" onClick={(event) => event.preventDefault()} aria-label="ClassLens home">
          <span className="cl-brand__mark" aria-hidden="true"><span /><span /><span /></span>
          <span className="cl-brand__wordmark">Class<span>Lens</span></span>
        </a>

        <div className="cl-workspace-label">
          <span className="cl-workspace-label__avatar">R</span>
          <span className="cl-workspace-label__text"><strong>RBU Workspace</strong><small>{role === "teacher" ? "Teaching space" : "Learning space"}</small></span>
          <Icon name="chevron" size={17} />
        </div>

        <p className="cl-sidebar__section-label">WORKSPACE</p>
        <nav className="cl-nav" aria-label="Workspace">
          {navItems.map((item) => {
            const selected = activeItem === item.id;
            return (
              <a
                key={item.id}
                href={item.href ?? `#${item.id}`}
                className={`cl-nav__item${selected ? " cl-nav__item--active" : ""}`}
                aria-current={selected ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setSidebarOpen(false);
                  onNavigate?.(item);
                }}
              >
                <span className="cl-nav__icon">{item.icon ?? <Icon name="book" />}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && <span className="cl-nav__badge">{item.badge}</span>}
              </a>
            );
          })}
        </nav>

        <div className="cl-sidebar__bottom">
          <div className="cl-sidebar-tip">
            <span className="cl-sidebar-tip__spark" aria-hidden="true">✦</span>
            <strong>Learning, in focus.</strong>
            <p>Small steps add up to big progress.</p>
          </div>
          <div className="cl-sidebar__footer">© RBU ClassLens</div>
        </div>
      </aside>

      <div className="cl-main-column">
        <header className="cl-topbar">
          <div className="cl-topbar__left">
            <button
              className="cl-icon-button cl-mobile-menu"
              type="button"
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <Icon name={sidebarOpen ? "close" : "menu"} />
            </button>
            <div className="cl-breadcrumb"><span>Workspace</span><Icon name="chevron" size={15} /><strong>{pageTitle ?? navItems.find((item) => item.id === activeItem)?.label ?? "Overview"}</strong></div>
          </div>
          <div className="cl-topbar__right">
            <form
              className="cl-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                onSearch?.(String(data.get("q") ?? "").trim());
              }}
            >
              <Icon name="search" size={18} />
              <input name="q" type="search" placeholder="Search anything..." aria-label="Search ClassLens" />
              <kbd>⌘ K</kbd>
            </form>
            {headerActions}
            <button className="cl-icon-button cl-notification-button" type="button" aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ""}`} onClick={onNotificationsClick}>
              <Icon name="bell" />
              {notificationCount > 0 && <span className="cl-notification-dot" aria-hidden="true" />}
            </button>
            <span className="cl-topbar__divider" aria-hidden="true" />
            {menuItems.length ? (
              <ActionMenu
                label="Account menu"
                trigger={<UserAvatar user={user} initials={initials} />}
                items={menuItems}
              />
            ) : (
              <div className="cl-user-summary">
                <UserAvatar user={user} initials={initials} />
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="cl-main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

function UserAvatar({ user, initials }: { user: ClassLensUser; initials: string }) {
  return (
    <span className="cl-user-avatar">
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span aria-hidden="true">{initials}</span>}
      <span className="cl-user-avatar__details">
        <strong>{user.name}</strong>
        {user.email && <small>{user.email}</small>}
      </span>
      <Icon name="chevron" size={16} />
    </span>
  );
}
