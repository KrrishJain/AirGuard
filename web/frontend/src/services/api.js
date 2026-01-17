// src/services/axios.js (or wherever your axios config is)

import axios from "axios";

const baseURL = import.meta.env.PROD
  ? '/api/proxy'
  : 'http://3.109.2.225:3001';

console.log('🌐 Environment:', import.meta.env.MODE);
console.log('🌐 Is Production:', import.meta.env.PROD);
console.log('🌐 API Base URL:', baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});