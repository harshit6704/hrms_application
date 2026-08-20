import axios from "axios";

// Base URL comes from .env -> VITE_API_BASE_URL (see .env.example)
const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
});

// Attach the JWT to every request automatically.
// Backend (utils/jwt_handler.py) expects: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: clear session and bounce to /login.
// We use a listener pattern so AuthContext can own the actual state clearing.
let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Extracts a friendly message from a FastAPI error response.
// FastAPI validation errors (422) come back as { detail: [{ loc, msg, type }, ...] }
// Most other errors come back as { detail: "some string" }.
export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (!detail) {
    if (error?.message === "Network Error") {
      return "Can't reach the server. Check that the API is running and VITE_API_BASE_URL is correct.";
    }
    return "Something went wrong. Please try again.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join(" | ");
  }

  return "Something went wrong. Please try again.";
}
