import { AlertTriangle, Bell, ShoppingCart } from 'lucide-react';
import { EmptyState } from '../../../components/shared/EmptyState';
import type { MerchantNotification } from '../../../types/merchant';

interface MerchantNotificationsProps {
  notifications: MerchantNotification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  updatingNotificationId: string | null;
  onDismissNotificationsError: () => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  formatRelativeTime: (iso: string) => string;
}

const renderNotificationIcon = (type: MerchantNotification['type']) => {
  if (type === 'order_received') return <ShoppingCart className="w-4 h-4 text-[var(--ff-success)]" />;
  if (type === 'low_stock') return <AlertTriangle className="w-4 h-4 text-amber-300" />;
  if (type === 'high_value_order') return <AlertTriangle className="w-4 h-4 text-[var(--ff-error)]" />;
  return <Bell className="w-4 h-4 text-[var(--ff-ink-muted)]" />;
};

export function MerchantNotifications({
  notifications,
  notificationsLoading,
  notificationsError,
  updatingNotificationId,
  onDismissNotificationsError,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  formatRelativeTime,
}: MerchantNotificationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--ff-ink)]">Notifications</h3>
        <button
          onClick={onMarkAllNotificationsRead}
          className="text-xs text-[var(--ff-success)] hover:text-[var(--ff-success-bold)]"
        >
          Mark all as read
        </button>
      </div>

      {notificationsError && (
        <div className="bg-[var(--ff-error-bold)] border border-[var(--ff-error)] rounded-xl px-4 py-3 text-sm text-white flex items-start justify-between gap-3">
          <p>{notificationsError}</p>
          <button
            type="button"
            onClick={onDismissNotificationsError}
            className="leading-none min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--ff-ink)] hover:opacity-80"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {notificationsLoading ? (
        <div className="rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface)] p-4 text-sm text-[var(--ff-ink)] flex items-center gap-3">
          <svg className="w-5 h-5 text-[var(--ff-success)] animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="w-10 h-10 text-[var(--ff-ink-muted)]" />} title="No notifications" description="You're all caught up — no notifications." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-xl p-4 ${
                notification.type === 'high_value_order'
                    ? 'border-[var(--ff-error)] bg-[var(--ff-error-subtle)]'
                  : notification.read
                    ? 'bg-[var(--ff-surface)] border-[var(--ff-border)]'
                    : 'bg-[var(--ff-surface)] border-[var(--ff-border)] border-l-[3px] border-l-[var(--ff-cta)] ring-1 ring-[var(--ff-cta)]/15'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{renderNotificationIcon(notification.type)}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--ff-ink-muted)]">
                      {(notification.type ?? 'notice').replace(/_/g, ' ')}
                    </p>
                    <p className={`text-sm ${notification.read ? 'text-[var(--ff-ink)]' : 'text-[var(--ff-ink)] font-semibold'}`}>{notification.title}</p>
                    <p className="text-xs text-[var(--ff-ink-muted)] mt-1">{notification.message}</p>
                    <p className="text-xs text-[var(--ff-ink-muted)] mt-2">{formatRelativeTime(notification.created_at)}</p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkNotificationRead(notification.id)}
                    disabled={updatingNotificationId === notification.id}
                    className="text-xs text-[var(--ff-success)] hover:text-[var(--ff-success-bold)] disabled:text-[var(--ff-ink-muted)] px-3 py-3 min-h-[44px] rounded-lg border border-[var(--ff-border)] bg-white/5"
                  >
                    {updatingNotificationId === notification.id ? 'Updating...' : 'Mark as read'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
