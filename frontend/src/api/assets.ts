import type { Asset, AssetRequest } from '../types/asset';

const API_URL = 'http://localhost:8080/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const error = await res.json();
      message = error.detail || error.title || message;
    } catch {
      // el body no era JSON
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function listAssetsByCustomer(customerId: number): Promise<Asset[]> {
  const res = await fetch(`${API_URL}/customers/${customerId}/assets`);
  return handleResponse<Asset[]>(res);
}

export async function getAsset(id: number): Promise<Asset> {
  const res = await fetch(`${API_URL}/assets/${id}`);
  return handleResponse<Asset>(res);
}

export async function createAsset(customerId: number, data: AssetRequest): Promise<Asset> {
  const res = await fetch(`${API_URL}/customers/${customerId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Asset>(res);
}

export async function updateAsset(id: number, data: AssetRequest): Promise<Asset> {
  const res = await fetch(`${API_URL}/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Asset>(res);
}

export async function deleteAsset(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/assets/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}