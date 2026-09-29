import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getDashboardStats } from '../api/dashboard';

const COLORES_ESTADO: Record<string, string> = {
  BORRADOR: '#9ca3af',
  ENVIADA: '#3b82f6',
  APROBADA: '#22c55e',
  RECHAZADA: '#ef4444',
};

const LABEL_ESTADO: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  function formatMoney(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatMonth(ym: string) {
    const [year, month] = ym.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('es-CO', { month: 'short' });
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando dashboard...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error)?.message || 'No se pudo cargar el dashboard'}
        </div>
      </div>
    );
  }

  const datosDona = Object.entries(data.cotizacionesPorEstado)
    .filter(([, count]) => count > 0)
    .map(([estado, count]) => ({
      name: LABEL_ESTADO[estado] || estado,
      value: count,
      color: COLORES_ESTADO[estado] || '#9ca3af',
    }));

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
          Resumen del taller al día de hoy
        </p>
      </div>

      {/* --- Tarjetas KPI --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Ingresos del mes"
          value={formatMoney(data.ingresosMes)}
          emoji="💰"
          color="text-green-600 dark:text-green-400"
        />
        <KPICard
          title="Cotizaciones del mes"
          value={String(data.cotizacionesMes)}
          emoji="📄"
          color="text-blue-600 dark:text-blue-400"
        />
        <KPICard
          title="Órdenes abiertas"
          value={String(data.ordenesAbiertas + data.ordenesEnProceso)}
          emoji="🔧"
          color="text-yellow-600 dark:text-yellow-400"
          subtitle={`${data.ordenesAbiertas} abiertas · ${data.ordenesEnProceso} en proceso`}
        />
        <KPICard
          title="Clientes totales"
          value={String(data.totalClientes)}
          emoji="👥"
          color="text-purple-600 dark:text-purple-400"
          subtitle={`${data.totalAssets} vehículos/equipos`}
        />
      </div>

      {/* --- Segunda fila: gráfico de línea + dona --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100 mb-4">
            Ingresos últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.ingresosUltimosMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="mes"
                tickFormatter={formatMonth}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                formatter={(value) => formatMoney(Number(value))}
                labelFormatter={(label) => {
                  const [y, m] = String(label).split('-');
                  return `${m}/${y}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100 mb-4">
            Cotizaciones por estado
          </h2>
          {datosDona.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              No hay cotizaciones todavía
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={datosDona}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {datosDona.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- Tercera fila: top clientes + tasa de aprobación --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">
              Top 5 clientes por facturación
            </h2>
          </div>
          {data.topClientes.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              Aún no hay órdenes entregadas
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Cliente
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Órdenes
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Total facturado
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topClientes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-6 py-3">
                      <Link
                        to={`/customers/${c.id}`}
                        className="text-gray-800 dark:text-zinc-100 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {c.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600 dark:text-zinc-400">
                      {c.ordenes}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-800 dark:text-zinc-100 font-semibold">
                      {formatMoney(c.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-center">
          <div className="text-center">
            <div className="text-gray-500 dark:text-zinc-400 text-sm mb-2">
              Tasa de aprobación
            </div>
            <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              {data.tasaAprobacion.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">
              De las cotizaciones respondidas
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-zinc-800 mt-6 pt-6 text-center">
            <div className="text-gray-500 dark:text-zinc-400 text-sm mb-1">
              Por aprobar
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.cotizacionesPorAprobar}
            
            </div>
            <div className="text-xs text-gray-400">
              Enviadas esperando respuesta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  emoji: string;
  color: string;
  subtitle?: string;
}

function KPICard({ title, value, emoji, color, subtitle }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
          {title}
        </span>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-400">{subtitle}</div>
      )}
    </div>
  );
}   