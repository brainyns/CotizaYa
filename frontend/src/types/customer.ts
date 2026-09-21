export interface Customer {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  notas?: string | null;
}