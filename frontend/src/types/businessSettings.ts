export interface BusinessSettings {
  id: number;
  nombreTaller: string;
  nit: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  notasPie: string | null;
  logoBase64: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettingsRequest {
  nombreTaller: string;
  nit?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  notasPie?: string | null;
  logoBase64?: string | null;
}