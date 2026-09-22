export type AssetType =
  | 'VEHICULO'
  | 'ELECTRODOMESTICO'
  | 'INMUEBLE'
  | 'EQUIPO'
  | 'OTRO';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  VEHICULO: 'Vehículo',
  ELECTRODOMESTICO: 'Electrodoméstico',
  INMUEBLE: 'Inmueble',
  EQUIPO: 'Equipo',
  OTRO: 'Otro',
};

export interface Asset {
  id: number;
  customerId: number;
  tipo: AssetType;
  marca: string | null;
  modelo: string | null;
  placaSerial: string | null;
  anio: number | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRequest {
  tipo: AssetType;
  marca?: string | null;
  modelo?: string | null;
  placaSerial?: string | null;
  anio?: number | null;
  notas?: string | null;
}