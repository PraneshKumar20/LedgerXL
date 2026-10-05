import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? "/api"
    : "http://localhost:5000/api"
);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-type": "application/json"
  }
});

// Attach Authorization: Bearer <token> if token exists in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {
          // Ignore localStorage errors
        }
        const pathname = window.location.pathname || "";
        if (!pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

