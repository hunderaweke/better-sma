import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { AppNotification, NotificationType } from "../utils/notifications";

const NOTIFY_EVENT = "better-sma:notify";

function getIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-4 w-4" />;
    case "warning":
    case "error":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function getToneClass(type: NotificationType) {
  switch (type) {
    case "success":
      return "border-emerald-500/40 bg-emerald-100/90 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-50";
    case "warning":
      return "border-amber-500/40 bg-amber-100/90 text-amber-950 dark:bg-amber-950/80 dark:text-amber-50";
    case "error":
      return "border-red-500/40 bg-red-100/90 text-red-950 dark:bg-red-950/80 dark:text-red-50";
    default:
      return "border-gray-500/40 bg-gray-100/90 text-gray-950 dark:bg-gray-900/80 dark:text-gray-50";
  }
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<AppNotification, "id">>;
      const detail = customEvent.detail;
      const id = window.crypto.randomUUID();
      const nextNotification: AppNotification = {
        id,
        title: detail.title,
        message: detail.message,
        type: detail.type,
        timeoutMs: detail.timeoutMs,
      };

      setNotifications((currentNotifications) => [
        nextNotification,
        ...currentNotifications,
      ]);

      const timeout = window.setTimeout(() => {
        setNotifications((currentNotifications) =>
          currentNotifications.filter((item) => item.id !== id),
        );
      }, detail.timeoutMs ?? 3000);

      return () => window.clearTimeout(timeout);
    };

    window.addEventListener(NOTIFY_EVENT, handleNotification);

    return () => {
      window.removeEventListener(NOTIFY_EVENT, handleNotification);
    };
  }, []);

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 4),
    [notifications],
  );

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`border px-4 py-3 shadow-lg backdrop-blur-xl ${getToneClass(notification.type)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              {getIcon(notification.type)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{notification.title}</p>
              {notification.message ? (
                <p className="mt-1 text-xs leading-relaxed opacity-85">
                  {notification.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
