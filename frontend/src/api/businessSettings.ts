import type {
  BusinessSettings,
  BusinessSettingsRequest,
} from '../types/businessSettings';

const API_URL = 'http://localhost:8080/api/business-settings';

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
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const res = await fetch(API_URL);
  return handleResponse<BusinessSettings>(res);
}

export async function updateBusinessSettings(
  data: BusinessSettingsRequest
): Promise<BusinessSettings> {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<BusinessSettings>(res);
}