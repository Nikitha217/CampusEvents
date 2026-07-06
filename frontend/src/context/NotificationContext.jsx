import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getUnreadCount } from "../services/notificationService";

const NotificationContext = createContext();

export const useNotificationContext = () => useContext(NotificationContext);

let hasFetchedNotificationCount = false;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Ref to track if a request is already in progress (deduplication)
  const loadingRef = useRef(false);

  const fetchNotificationCount = useCallback(async () => {
    // If not authenticated or a request is already in flight, do nothing
    if (!isAuthenticated || !user?.id || loadingRef.current) return;

    try {
      loadingRef.current = true;
      const count = await getUnreadCount();
      setUnreadCount(typeof count === "number" ? count : (count?.count || 0));
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (hasFetchedNotificationCount) return;
    if (isAuthenticated && user?.id) {
       hasFetchedNotificationCount = true;
       fetchNotificationCount();
    }
  }, [isAuthenticated, user?.id, fetchNotificationCount]);

  // Method to manually update count (e.g. when marking read in Notifications.jsx)
  const decrementCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const refreshCount = useCallback(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, decrementCount, refreshCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
