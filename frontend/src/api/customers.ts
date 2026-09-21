import type { Customer, CustomerRequest } from '../types/customer';

const API_URL = 'http://localhost:8080/api/customers';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const error = await res.json();
      message = error.detail || error.title || message;
    } catch {
      // el body no era JSON, dejamos el mensaje genérico
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function listCustomers(q?: string): Promise<Customer[]> {
  const url = q ? `${API_URL}?q=${encodeURIComponent(q)}` : API_URL;
  const res = await fetch(url);
  return handleResponse<Customer[]>(res);
}

export async function getCustomer(id: number): Promise<Customer> {
  const res = await fetch(`${API_URL}/${id}`);
  return handleResponse<Customer>(res);
}

export async function createCustomer(data: CustomerRequest): Promise<Customer> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Customer>(res);
}

export async function updateCustomer(id: number, data: CustomerRequest): Promise<Customer> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Customer>(res);
}

export async function deleteCustomer(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}