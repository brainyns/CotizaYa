export interface IngresoMensual {
  mes: string; // "2026-04"
  total: number;
}

export interface ClienteTop {
  id: number;
  nombre: string;
  total: number;
  ordenes: number;
}

export interface DashboardStats {
  totalClientes: number;
  totalAssets: number;
  cotizacionesMes: number;
  cotizacionesPorAprobar: number;
  ingresosMes: number;
  ordenesAbiertas: number;
  ordenesEnProceso: number;
  tasaAprobacion: number;
  cotizacionesPorEstado: Record<string, number>;
  ingresosUltimosMeses: IngresoMensual[];
  topClientes: ClienteTop[];
}