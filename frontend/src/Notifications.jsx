import { useEffect, useState } from "react";

import {
  Bell,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";
import { useNotificationContext } from "../context/NotificationContext";

export default function Notifications() {

  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const { unreadCount, refreshCount } = useNotificationContext();

  const [loading, setLoading] =
    useState(true);

  const userId =
    user?.id;

  const role =
    user?.role?.toUpperCase();

  const loadNotifications =
    async () => {

      if (!userId) return;

      try {

        setLoading(true);

        const data =
          await getNotifications(
            userId,
            role
          );

        setNotifications(data);

      } catch (err) {

        console.error(
          "Notification fetch error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    loadNotifications();

  }, [userId, role]);

  const handleRead =
    async (id) => {

      try {

        await markNotificationRead(
          id
        );

        loadNotifications();
        refreshCount();

      } catch (err) {

        console.error(err);
      }
    };

  if (loading) {

    return (

      <div className="p-6">

        Loading notifications...

      </div>
    );
  }

  return (

    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <Bell size={28} />

          <h1 className="text-3xl font-bold">

            Notifications

          </h1>

        </div>

        <div className="flex items-center gap-4">

          <span
            className="
              bg-red-500
              text-white
              px-3
              py-1
              rounded-full
              text-sm
            "
          >

            {unreadCount} unread

          </span>

          <button
            onClick={loadNotifications}
            className="
              border
              px-4
              py-2
              rounded-lg
              flex
              items-center
              gap-2
            "
          >

            <RefreshCw size={16} />

            Refresh

          </button>

        </div>

      </div>

      {notifications.length === 0 && (

        <div
          className="
            text-center
            border
            rounded-xl
            p-12
          "
        >

          No notifications available

        </div>
      )}

      <div className="space-y-4">

        {notifications.map((notification) => (

          <div
            key={notification.id}
            className={`
              border
              rounded-xl
              p-5

              ${
                notification.read
                  ? "bg-white shadow-sm"
                  : "bg-violet-500/20 border-violet-500/40 shadow-lg shadow-violet-500/20"
              }
            `}
          >

            <div className="flex justify-between">

              <div>

                <h3 className="text-lg font-semibold">

                  {notification.title}

                </h3>

                <p className="mt-2 text-gray-600">

                  {notification.message}

                </p>

                <div className="mt-3 flex gap-2 flex-wrap">

                  <span
                    className="
                      text-xs
                      bg-gray-100
                      px-2
                      py-1
                      rounded
                    "
                  >
                    {notification.type}
                  </span>

                  <span
                    className="
                      text-xs
                      bg-indigo-100
                      text-indigo-700
                      px-2
                      py-1
                      rounded
                    "
                  >
                    {notification.role}
                  </span>

                </div>

                <p className="text-xs text-gray-400 mt-3">

                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}

                </p>

              </div>

              {!notification.read && (

                <button
                  onClick={() =>
                    handleRead(
                      notification.id
                    )
                  }
                  className="
                    bg-green-600
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    flex
                    items-center
                    gap-2
                    h-fit
                  "
                >

                  <CheckCircle size={18} />

                  Read

                </button>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}