import axios from "axios";

const baseURL = import.meta.env.PROD
  ? "/api"
  : "http://3.109.2.225:3001/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
