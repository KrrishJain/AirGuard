import axios from "axios";

const baseURL =
  import.meta?.env?.VITE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "../../eslint.config";

export const api = axios.create({
  baseURL,
  withCredentials: true, // keep only if you use cookies/session auth
});
