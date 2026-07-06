import axios from "axios";

/* ── Cookie helpers ─────────────────────────────────────────────────────── */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
};

export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value || "")}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

/* ── Axios instance ─────────────────────────────────────────────────────── */
// FIX: use VITE_API_BASE_URL env variable so it works in production
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
});

/* Request: attach JWT ────────────────────────────────────────────────────── */
API.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      const clean = token.startsWith("Bearer ") ? token.substring(7) : token;
      config.headers.Authorization = `Bearer ${clean}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Response: unwrap ApiResponse wrapper ─────────────────────────────────── */
// The backend wraps all responses in { success, message, data }.
// This interceptor transparently unwraps data.data so pages work without changes.
API.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (!body.success) {
        return Promise.reject({
          response: {
            ...response,
            data: body.message || "An error occurred",
            status: response.status,
          },
        });
      }
      // Unwrap: response.data = the actual payload
      response.data = body.data !== undefined ? body.data : body;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
