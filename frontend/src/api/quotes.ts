import type { Quote, QuoteRequest, QuoteStatus } from '../types/quote';

const API_URL = 'http://localhost:8080/api/quotes';

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

export async function listQuotes(filters?: {
  customerId?: number;
  estado?: QuoteStatus;
}): Promise<Quote[]> {
  const params = new URLSearchParams();
  if (filters?.customerId) params.set('customerId', String(filters.customerId));
  if (filters?.estado) params.set('estado', filters.estado);
  const query = params.toString();
  const res = await fetch(query ? `${API_URL}?${query}` : API_URL);
  return handleResponse<Quote[]>(res);
}

export async function getQuote(id: number): Promise<Quote> {
  const res = await fetch(`${API_URL}/${id}`);
  return handleResponse<Quote>(res);
}

export async function createQuote(data: QuoteRequest): Promise<Quote> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Quote>(res);
}

export async function updateQuote(id: number, data: QuoteRequest): Promise<Quote> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Quote>(res);
}

export async function changeQuoteStatus(id: number, estado: QuoteStatus): Promise<Quote> {
  const res = await fetch(`${API_URL}/${id}/estado?estado=${estado}`, {
    method: 'PATCH',
  });
  return handleResponse<Quote>(res);
}

export async function deleteQuote(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}