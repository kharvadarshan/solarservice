// src/api.js
import axios from "axios";
import { store } from "./reduxStore/store";

// Create instance
const api = axios.create({
  baseURL: "http://localhost:5000", // change this to your backend base URL
  withCredentials: true, // if you need cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if available
api.interceptors.request.use(
  (config) => {
    const state =store.getState();
     const token = state.auth.token;  // your token key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
