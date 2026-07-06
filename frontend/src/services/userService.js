import API from "./api";

/**
 * userService – all /api/users endpoints.
 *
 * FIX: Was missing entirely. ManageUsers used inline API calls with wrong
 *      endpoint paths (/users/all, /users/{id}/status, /users/profile).
 *      This service centralises all user calls with the correct paths.
 */
const userService = {
  /* Admin: get all users */
  getAllUsers: async () => {
    const response = await API.get("/users");
    return response.data;
  },

  /* Get current user profile (JWT-based) */
  getMe: async () => {
    const response = await API.get("/users/me");
    return response.data;
  },

  /* Update current user profile */
  updateMe: async (profileData) => {
    const response = await API.put("/users/me", profileData);
    return response.data;
  },

  /* Change current user password */
  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put("/users/me/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /* Admin: toggle user enabled/disabled */
  toggleStatus: async (id) => {
    const response = await API.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  /* Admin: update user role */
  updateRole: async (id, role) => {
    const response = await API.put(`/users/${id}/role`, { role });
    return response.data;
  },

  /* Admin: delete user */
  deleteUser: async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  },

  /* Admin: get users by role */
  getUsersByRole: async (role) => {
    const response = await API.get(`/users/role/${role}`);
    return response.data;
  },
};

export default userService;
