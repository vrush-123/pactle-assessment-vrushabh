import axios from 'axios';
import { storage } from './storage';

export const apiClient = axios.create({
  baseURL: '/api', 
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});