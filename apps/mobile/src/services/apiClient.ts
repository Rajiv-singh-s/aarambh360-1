import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { auth } from '../firebaseConfig';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://aarambh360-1.onrender.com';

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function attachAuthToken(config: InternalAxiosRequestConfig) {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(attachAuthToken);

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (status === 401 && original && !original._retry && auth.currentUser) {
        original._retry = true;
        const token = await auth.currentUser.getIdToken(true);
        original.headers.Authorization = `Bearer ${token}`;
        return client.request(original);
      }

      if (status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createClient();

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<{ data: T }>(path, { params });
  return response.data.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<{ data: T }>(path, body);
  return response.data.data;
}

export async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.delete<{ data: T }>(path, body ? { data: body } : undefined);
  return response.data.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<{ data: T }>(path, body);
  return response.data.data;
}
