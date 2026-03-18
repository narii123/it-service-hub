import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export const api = axios.create({
  baseURL: API_URL,
});