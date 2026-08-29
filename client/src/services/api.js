import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jobify_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on expired/invalid token
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobify_token");
      localStorage.removeItem("jobify_user");
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const jobApi = {
  list: (params) => api.get("/jobs", { params }),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  remove: (id) => api.delete(`/jobs/${id}`),
  mine: () => api.get("/jobs/recruiter/my"),
};

export const applicationApi = {
  apply: (jobId, data) => api.post(`/applications/${jobId}`, data),
  mine: () => api.get("/applications/my"),
  forJob: (jobId) => api.get(`/applications/job/${jobId}`),
  allForRecruiter: () => api.get("/applications/recruiter/all"),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  stats: () => api.get("/applications/stats"),
};

export default api;
