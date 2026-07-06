import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle, RefreshCw, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";

const TYPE_COLORS = {
  LOGIN:        "bg-blue-500/20 border-blue-500/30 text-blue-300",
  EVENT:        "bg-purple-500/20 border-purple-500/30 text-purple-300",
  USER:         "bg-green-500/20 border-green-500/30 text-green-300",
  REGISTRATION: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  ATTENDANCE:   "bg-teal-500/20 border-teal-500/30 text-teal-300",
  SYSTEM:       "bg-slate-500/20 border-slate-500/30 text-slate-300",
  DEFAULT:      "bg-slate-500/20 border-slate-500/30 text-slate-300",
};

const typeColor = (type) =>
  TYPE_COLORS[type?.toUpperCase()] ?? TYPE_COLORS.DEFAULT;

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function Notifications() {
  const { user } = useAuth();

  const { unreadCount, decrementCount } = useNotificationContext();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [markingId,     setMarkingId]     = useState(null);

  const userId = user?.id;
  const role   = user?.role?.toUpperCase();

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Both functions now return the actual payload directly
      // (api.js interceptor has already unwrapped { success, data })
      const notifs = await getNotifications(userId, role);

      // notifs  is already Array   — no .data needed
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notificationId) => {
    if (markingId) return;
    setMarkingId(notificationId);
    try {
      await markNotificationRead(notificationId);
      // Optimistic UI update — no full reload needed
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      decrementCount();
    } catch (err) {
      console.error("Mark read failed:", err);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>

        <button
          onClick={loadNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/25">
          <Bell className="h-4 w-4 text-purple-300" />
          <span className="text-sm text-purple-200 font-medium">
            {notifications.length} Total
          </span>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/25">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-blue-200 font-medium">
              {unreadCount} Unread
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading notifications...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <Inbox className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-white font-semibold mb-1">No notifications yet</h3>
          <p className="text-slate-500 text-sm">You're all caught up!</p>
        </div>
      )}

      {/* Notification list */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-200 ${
                notification.read
                  ? "border-white/10 opacity-70"
                  : "border-purple-500/30 shadow-lg shadow-purple-500/10"
              }`}
            >
              {/* Unread dot */}
              {!notification.read && (
                <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-purple-400 animate-pulse" />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bell className="h-5 w-5 text-purple-300" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white text-sm">
                      {notification.title}
                    </h3>

                    {notification.type && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColor(notification.type)}`}
                      >
                        {notification.type}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      {timeAgo(notification.createdAt)}
                    </span>

                    {!notification.read ? (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markingId === notification.id}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {markingId === notification.id ? "Marking..." : "Mark as read"}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}