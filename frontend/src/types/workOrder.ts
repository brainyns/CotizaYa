export type WorkOrderStatus =
  | 'ABIERTA'
  | 'EN_PROCESO'
  | 'TERMINADA'
  | 'ENTREGADA'
  | 'CANCELADA';

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  ABIERTA: 'Abierta',
  EN_PROCESO: 'En proceso',
  TERMINADA: 'Terminada',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  ABIERTA: 'bg-gray-100 text-gray-700',
  EN_PROCESO: 'bg-yellow-100 text-yellow-800',
  TERMINADA: 'bg-blue-100 text-blue-700',
  ENTREGADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
};

export interface WorkOrderItem {
  id: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  orden: number;
}

export interface WorkOrderItemRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface WorkOrder {
  id: number;
  numero: string;
  quoteId: number | null;
  quoteNumero: string | null;
  customerId: number;
  customerNombre: string;
  assetId: number | null;
  assetDescripcion: string | null;
  estado: WorkOrderStatus;
  notas: string | null;
  total: number;
  fechaApertura: string;
  fechaCierre: string | null;
  fechaEntrega: string | null;
  items: WorkOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderRequest {
  customerId: number;
  assetId?: number | null;
  quoteId?: number | null;
  notas?: string | null;
  items: WorkOrderItemRequest[];
}