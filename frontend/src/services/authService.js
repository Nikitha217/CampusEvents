import API from "./api";

const authService = {

  /* Email login */
  login: async (email, password) => {
    const response = await API.post("/auth/signin", {
      email,
      password,
    });

    return response.data;
  },

  /* Email signup */
  register: async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
  },

  /* Google Login / Signup */
  googleLogin: async (idToken, selectedRole) => {
    const response = await API.post("/auth/google", {
      idToken,

      // IMPORTANT: backend expects this name
      selectedRole: selectedRole,
    });

    return response.data;
  },

  /* Current user */
  getCurrentUser: async () => {
    const response = await API.get("/auth/test-auth");
    return response.data;
  },

  logout: () => {
    // handled in auth context
  },
};

export default authService;