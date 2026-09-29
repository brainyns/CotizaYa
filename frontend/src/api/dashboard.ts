import type { DashboardStats } from '../types/dashboard';

const API_URL = 'http://localhost:8080/api/dashboard';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const error = await res.json();
      message = error.detail || error.title || message;
    } catch {
      // no era JSON
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/stats`);
  return handleResponse<DashboardStats>(res);
}