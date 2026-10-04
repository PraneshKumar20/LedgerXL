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

export default axiosInstance;

