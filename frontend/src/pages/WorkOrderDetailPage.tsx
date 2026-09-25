import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkOrder,
  changeWorkOrderStatus,
  deleteWorkOrder,
} from '../api/workOrders';
import type { WorkOrder, WorkOrderStatus } from '../types/workOrder';
import { WorkOrderStatusBadge } from '../components/WorkOrderStatusBadge';

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const woId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wo, isLoading, isError, error } = useQuery({
    queryKey: ['work-order', woId],
    queryFn: () => getWorkOrder(woId),
    enabled: !isNaN(woId),
  });

  const statusMutation = useMutation({
    mutationFn: (estado: WorkOrderStatus) => changeWorkOrderStatus(woId, estado),
    onSuccess: (updated) => {
      queryClient.setQueryData(['work-order', woId], updated);
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (err) => alert((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkOrder(woId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      navigate('/work-orders');
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleDelete() {
    if (wo && confirm(`¿Eliminar la orden ${wo.numero}?`)) {
      deleteMutation.mutate();
    }
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  function formatDateTime(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isNaN(woId)) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ID de orden inválido
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-500">
        Cargando orden...
      </div>
    );
  }

  if (isError || !wo) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error)?.message || 'Orden no encontrada'}
        </div>
      </div>
    );
  }

  const puedeEditar = wo.estado === 'ABIERTA' || wo.estado === 'EN_PROCESO';
  const puedeEliminar = wo.estado === 'ABIERTA' || wo.estado === 'CANCELADA';
  const esFinal = wo.estado === 'ENTREGADA' || wo.estado === 'CANCELADA';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link
        to="/work-orders"
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
      >
        ← Volver a órdenes
      </Link>

      {/* --- Cabecera --- */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{wo.numero}</h1>
            <div className="flex items-center gap-3">
              <WorkOrderStatusBadge status={wo.estado} />
              {wo.quoteNumero && (
                <Link
                  to={`/quotes/${wo.quoteId}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  desde cotización {wo.quoteNumero}
                </Link>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {puedeEditar && (
              <Link
                to={`/work-orders/${wo.id}/edit`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Editar
              </Link>
            )}
            {puedeEliminar && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Cliente</div>
            <div className="text-gray-800 font-medium">{wo.customerNombre}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Vehículo / Equipo</div>
            <div className="text-gray-800">{wo.assetDescripcion || '—'}</div>
          </div>
        </div>

        {/* --- Fechas del flujo --- */}
        <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-gray-500 mb-1">Apertura</div>
            <div className="text-gray-800">{formatDateTime(wo.fechaApertura)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Cierre</div>
            <div className="text-gray-800">{formatDateTime(wo.fechaCierre)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Entrega</div>
            <div className="text-gray-800">{formatDateTime(wo.fechaEntrega)}</div>
          </div>
        </div>

        {wo.notas && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-gray-500 text-sm mb-1">Notas</div>
            <div className="text-gray-700 italic">{wo.notas}</div>
          </div>
        )}
      </div>

      {/* --- Ítems --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Ítems</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Descripción</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-24">Cantidad</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-32">Precio</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {wo.items.map((it) => (
              <tr key={it.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-800">{it.descripcion}</td>
                <td className="px-4 py-3 text-right text-gray-600">{it.cantidad}</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatMoney(it.precioUnitario)}
                </td>
                <td className="px-4 py-3 text-right text-gray-800 font-medium">
                  {formatMoney(it.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">
                Total:
              </td>
              <td className="px-4 py-3 text-right text-2xl font-bold text-blue-600">
                {formatMoney(wo.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- Acciones de estado --- */}
      {!esFinal && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones</h3>
          <div className="flex gap-3 flex-wrap">
            {wo.estado === 'ABIERTA' && (
              <button
                onClick={() => statusMutation.mutate('EN_PROCESO')}
                disabled={statusMutation.isPending}
                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium disabled:opacity-50"
              >
                ▶ Iniciar trabajo
              </button>
            )}
            {wo.estado === 'EN_PROCESO' && (
              <button
                onClick={() => statusMutation.mutate('TERMINADA')}
                disabled={statusMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                ✓ Marcar terminada
              </button>
            )}
            {wo.estado === 'TERMINADA' && (
              <button
                onClick={() => statusMutation.mutate('ENTREGADA')}
                disabled={statusMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
              >
                📦 Marcar entregada
              </button>
            )}
            {(wo.estado === 'ABIERTA' || wo.estado === 'EN_PROCESO') && (
              <button
                onClick={() => {
                  if (confirm('¿Cancelar esta orden de trabajo?')) {
                    statusMutation.mutate('CANCELADA');
                  }
                }}
                disabled={statusMutation.isPending}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 font-medium disabled:opacity-50"
              >
                × Cancelar orden
              </button>
            )}
          </div>
        </div>
      )}

      {esFinal && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Esta orden está {wo.estado === 'ENTREGADA' ? 'entregada' : 'cancelada'} y no admite más cambios.
        </div>
      )}
    </div>
  );
}