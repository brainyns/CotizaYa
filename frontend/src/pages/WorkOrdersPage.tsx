import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listWorkOrders, deleteWorkOrder } from '../api/workOrders';
import type { WorkOrder, WorkOrderStatus } from '../types/workOrder';
import { WorkOrderStatusBadge } from '../components/WorkOrderStatusBadge';
import { WORK_ORDER_STATUS_LABELS } from '../types/workOrder';

const FILTROS_ESTADO: (WorkOrderStatus | 'TODAS')[] = [
  'TODAS',
  'ABIERTA',
  'EN_PROCESO',
  'TERMINADA',
  'ENTREGADA',
  'CANCELADA',
];

export default function WorkOrdersPage() {
  const [filtroEstado, setFiltroEstado] = useState<WorkOrderStatus | 'TODAS'>('TODAS');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['work-orders', filtroEstado],
    queryFn: () =>
      listWorkOrders(filtroEstado === 'TODAS' ? undefined : { estado: filtroEstado }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleDelete(wo: WorkOrder) {
    if (confirm(`¿Eliminar la orden ${wo.numero}?`)) {
      deleteMutation.mutate(wo.id);
    }
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Solo se puede editar si está ABIERTA o EN_PROCESO
  function puedeEditar(estado: WorkOrderStatus) {
    return estado === 'ABIERTA' || estado === 'EN_PROCESO';
  }

  // Solo se puede eliminar si está ABIERTA o CANCELADA
  function puedeEliminar(estado: WorkOrderStatus) {
    return estado === 'ABIERTA' || estado === 'CANCELADA';
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Órdenes de trabajo</h1>
        <Link
          to="/work-orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Nueva orden
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS_ESTADO.map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filtroEstado === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'TODAS' ? 'Todas' : WORK_ORDER_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">Cargando...</div>
      )}

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error).message}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
          No hay órdenes con este filtro.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Número</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Cliente</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Vehículo</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Apertura</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((wo) => (
                <tr
                  key={wo.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                >
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {wo.numero}
                    {wo.quoteNumero && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        desde {wo.quoteNumero}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{wo.customerNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{wo.assetDescripcion || '—'}</td>
                  <td className="px-4 py-3">
                    <WorkOrderStatusBadge status={wo.estado} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800 font-medium">
                    {formatMoney(wo.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {formatDate(wo.fechaApertura)}
                  </td>
                  <td
                    className="px-4 py-3 text-right space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/work-orders/${wo.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver
                    </Link>
                    {puedeEditar(wo.estado) && (
                      <Link
                        to={`/work-orders/${wo.id}/edit`}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Editar
                      </Link>
                    )}
                    {puedeEliminar(wo.estado) && (
                      <button
                        onClick={() => handleDelete(wo)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}