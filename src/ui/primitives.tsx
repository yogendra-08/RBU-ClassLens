import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`cl-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="cl-dialog__content">
        <header className="cl-dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button
            className="cl-icon-button cl-dialog__close"
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="cl-dialog__body">{children}</div>
        {footer && <footer className="cl-dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}

export interface MenuItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ActionMenuProps {
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}

export function ActionMenu({
  label,
  trigger,
  items,
  align = "end",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const focusItem = (direction: 1 | -1) => {
    const enabled = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    if (!enabled?.length) return;
    const currentIndex = Array.from(enabled).indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : enabled.length - 1
        : (currentIndex + direction + enabled.length) % enabled.length;
    enabled[nextIndex]?.focus();
  };

  return (
    <div className="cl-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        className="cl-menu__trigger"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(1));
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          className={`cl-menu__popover cl-menu__popover--${align}`}
          role="menu"
          ref={menuRef}
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              triggerRef.current?.focus();
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              focusItem(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              focusItem(-1);
            } else if (event.key === "Home") {
              event.preventDefault();
              menuRef.current
                ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
                ?.focus();
            } else if (event.key === "End") {
              event.preventDefault();
              const enabled = menuRef.current?.querySelectorAll<HTMLButtonElement>(
                '[role="menuitem"]:not(:disabled)',
              );
              enabled?.[enabled.length - 1]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <button
              className={`cl-menu__item${item.destructive ? " cl-menu__item--destructive" : ""}`}
              type="button"
              role="menuitem"
              key={item.label}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon && <span className="cl-menu__item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Icon({
  name,
  size = 20,
}: {
  name: "menu" | "search" | "bell" | "chevron" | "close" | "home" | "book" | "task" | "people" | "chart" | "plus" | "arrow" | "calendar" | "clock" | "more";
  size?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <><path d="m7 10 5 5 5-5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8" /></>,
    task: <><path d="M9 5h10M9 12h10M9 19h10" /><path d="m3 5 1 1 2-2m-3 8 1 1 2-2m-3 8 1 1 2-2" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1z" /><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 3 4.5V20h-3" /></>,
    chart: <><path d="M4 19V5m0 14h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
