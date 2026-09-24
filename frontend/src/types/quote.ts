export type QuoteStatus = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700',
  ENVIADA: 'bg-blue-100 text-blue-700',
  APROBADA: 'bg-green-100 text-green-700',
  RECHAZADA: 'bg-red-100 text-red-700',
};

export interface QuoteItem {
  id: number | null;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  orden: number;
}

export interface QuoteItemRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Quote {
  id: number;
  numero: string;
  customerId: number;
  customerNombre: string;
  assetId: number | null;
  assetDescripcion: string | null;
  estado: QuoteStatus;
  notas: string | null;
  total: number;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequest {
  customerId: number;
  assetId?: number | null;
  notas?: string | null;
  items: QuoteItemRequest[];
}
