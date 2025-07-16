// utils/axiosInstance.ts
import axios from 'axios';
import { showGlobalLoader, hideGlobalLoader } from '@/contexts/loader-context';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(config => {
  showGlobalLoader();
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    hideGlobalLoader();
    return response;
  },
  error => {
    hideGlobalLoader();
    return Promise.reject(error);
  }
);

export default axiosInstance;
