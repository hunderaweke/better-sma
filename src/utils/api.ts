import axios, { AxiosHeaders } from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

export default api;
