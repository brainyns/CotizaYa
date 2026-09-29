import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Wrench } from 'lucide-react';
import { listWorkOrders, deleteWorkOrder } from '../api/workOrders';
import type { WorkOrder, WorkOrderStatus } from '../types/workOrder';
import { WorkOrderStatusBadge } from '../components/WorkOrderStatusBadge';
import { WORK_ORDER_STATUS_LABELS } from '../types/workOrder';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

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

  function puedeEditar(estado: WorkOrderStatus) {
    return estado === 'ABIERTA' || estado === 'EN_PROCESO';
  }

  function puedeEliminar(estado: WorkOrderStatus) {
    return estado === 'ABIERTA' || estado === 'CANCELADA';
  }

  return (
    <div className="p-6 w-full">
      <PageHeader
        title="Órdenes de trabajo"
        description="Gestiona las órdenes del taller"
        action={
          <Link to="/work-orders/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nueva orden
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS_ESTADO.map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filtroEstado === f
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {f === 'TODAS' ? 'Todas' : WORK_ORDER_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <Card>
          <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando órdenes...
          </div>
        </Card>
      )}

      {isError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          Error: {(error as Error).message}
        </div>
      )}

      {data && data.length === 0 && (
        <Card>
          <EmptyState
            icon={Wrench}
            title="No hay órdenes"
            description={
              filtroEstado !== 'TODAS'
                ? `No hay órdenes en estado "${WORK_ORDER_STATUS_LABELS[filtroEstado as WorkOrderStatus]}"`
                : 'Crea tu primera orden de trabajo para empezar'
            }
            action={
              <Link to="/work-orders/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Nueva orden
                </Button>
              </Link>
            }
          />
        </Card>
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Número
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Apertura
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((wo) => (
                <tr
                  key={wo.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {wo.numero}
                    </div>
                    {wo.quoteNumero && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                        desde {wo.quoteNumero}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {wo.customerNombre}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {wo.assetDescripcion || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <WorkOrderStatusBadge status={wo.estado} />
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(wo.total)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(wo.fechaApertura)}
                  </td>
                  <td
                    className="px-5 py-3.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/work-orders/${wo.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                      {puedeEditar(wo.estado) && (
                        <Link to={`/work-orders/${wo.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </Link>
                      )}
                      {puedeEliminar(wo.estado) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(wo)}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}