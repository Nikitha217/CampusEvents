import API from "./api";

/*
 GET ALL NOTIFICATIONS
*/

export const getNotifications =
async (userId, role) => {

  try {

    const response =
      await API.get(
        `/notifications`,
        {
          params: {
            userId,
            role,
          },
        }
      );

    return response.data;

  } catch (error) {

    console.error(
      "Error fetching notifications:",
      error
    );

    throw error;
  }
};

/*
 GET UNREAD COUNT
*/

let pendingRequest = null;

export const getUnreadCount = async () => {
  if (pendingRequest) return pendingRequest;

  pendingRequest = (async () => {
    try {
      const response = await API.get(`/notifications/unread-count`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    } finally {
      pendingRequest = null;
    }
  })();

  return pendingRequest;
};

/*
 MARK AS READ
*/

export const markNotificationRead =
async (notificationId) => {

  try {

    const response =
      await API.put(
        `/notifications/read/${notificationId}`
      );

    return response.data;

  } catch (error) {

    console.error(
      "Error marking notification read:",
      error
    );

    throw error;
  }
};

/*
 OPTIONAL:
 POLLING SUPPORT
*/

export const fetchNotificationsAndCount =
async (
  userId,
  role
) => {

  const notifications =
    await getNotifications(
      userId,
      role
    );

  const unreadCount =
    await getUnreadCount();

  return {
    notifications,
    unreadCount,
  };
};