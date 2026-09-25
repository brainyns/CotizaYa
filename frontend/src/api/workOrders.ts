import type { WorkOrder, WorkOrderRequest, WorkOrderStatus } from '../types/workOrder';

const API_URL = 'http://localhost:8080/api/work-orders';

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

export async function listWorkOrders(filters?: {
  customerId?: number;
  estado?: WorkOrderStatus;
}): Promise<WorkOrder[]> {
  const params = new URLSearchParams();
  if (filters?.customerId) params.set('customerId', String(filters.customerId));
  if (filters?.estado) params.set('estado', filters.estado);
  const query = params.toString();
  const res = await fetch(query ? `${API_URL}?${query}` : API_URL);
  return handleResponse<WorkOrder[]>(res);
}

export async function getWorkOrder(id: number): Promise<WorkOrder> {
  const res = await fetch(`${API_URL}/${id}`);
  return handleResponse<WorkOrder>(res);
}

export async function createWorkOrder(data: WorkOrderRequest): Promise<WorkOrder> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<WorkOrder>(res);
}

export async function updateWorkOrder(id: number, data: WorkOrderRequest): Promise<WorkOrder> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<WorkOrder>(res);
}

export async function changeWorkOrderStatus(
  id: number,
  estado: WorkOrderStatus
): Promise<WorkOrder> {
  const res = await fetch(`${API_URL}/${id}/estado?estado=${estado}`, {
    method: 'PATCH',
  });
  return handleResponse<WorkOrder>(res);
}

export async function deleteWorkOrder(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}