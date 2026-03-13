import axios from "axios";

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5012/api", // Adjusted port to match backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Add Token)
apiClient.interceptors.request.use(
  (config) => {
    // We will typically get the token from localStorage or Zustand store
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Handle 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle Token Expiry
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
