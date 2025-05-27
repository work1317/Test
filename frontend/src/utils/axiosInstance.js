import axios from "axios";
import env from "../config/env-config";

// Create Axios instance
const api = axios.create({
  baseURL: env.apiBaseUrl,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Request Interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access"); // Or from context
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response Interceptor – error handling
    api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optional: redirect to login on 401
        if (error.response && error.response.status === 401) {
        console.warn("Unauthorized, redirecting to login...");
        window.location.href = "/login";
        }
        return Promise.reject(error);
    }
    );

export default api;