import axios from "axios";

const baseURL = 
  import.meta.env.MODE === 'production'
    ? '/api/proxy'              // Vercel: use proxy (HTTPS → proxy → HTTP)
    : 'http://3.109.2.225:3001'; // Local: direct to EC2 (HTTP → HTTP, no browser block)

export const api = axios.create({
  baseURL,
  withCredentials: true,
});