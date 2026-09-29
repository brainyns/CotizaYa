import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import { listQuotes, deleteQuote } from '../api/quotes';
import type { Quote, QuoteStatus } from '../types/quote';
import { QuoteStatusBadge } from '../components/QuoteStatusBadge';
import { QUOTE_STATUS_LABELS } from '../types/quote';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const FILTROS_ESTADO: (QuoteStatus | 'TODAS')[] = [
  'TODAS',
  'BORRADOR',
  'ENVIADA',
  'APROBADA',
  'RECHAZADA',
];

export default function QuotesPage() {
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');
  const customerIdFilter = customerIdParam ? Number(customerIdParam) : undefined;

  const [filtroEstado, setFiltroEstado] = useState<QuoteStatus | 'TODAS'>('TODAS');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quotes', filtroEstado, customerIdFilter],
    queryFn: () =>
      listQuotes({
        ...(filtroEstado !== 'TODAS' && { estado: filtroEstado }),
        ...(customerIdFilter && { customerId: customerIdFilter }),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleDelete(quote: Quote) {
    if (confirm(`¿Eliminar la cotización ${quote.numero}?`)) {
      deleteMutation.mutate(quote.id);
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

  return (
    <div className="p-6 w-full">
      <PageHeader
        title="Cotizaciones"
        description={
          customerIdFilter
            ? 'Cotizaciones del cliente seleccionado'
            : 'Gestiona tus cotizaciones'
        }
        action={
          <Link to="/quotes/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nueva cotización
            </Button>
          </Link>
        }
      />

      {/* Chips de filtro */}
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
            {f === 'TODAS' ? 'Todas' : QUOTE_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <Card>
          <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando cotizaciones...
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
            icon={FileText}
            title="No hay cotizaciones"
            description={
              filtroEstado !== 'TODAS'
                ? `No hay cotizaciones en estado "${QUOTE_STATUS_LABELS[filtroEstado as QuoteStatus]}"`
                : 'Crea tu primera cotización para empezar'
            }
            action={
              <Link to="/quotes/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Nueva cotización
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
                  Fecha
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                  onClick={() => navigate(`/quotes/${q.id}`)}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {q.numero}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {q.customerNombre}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {q.assetDescripcion || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <QuoteStatusBadge status={q.estado} />
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatMoney(q.total)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(q.createdAt)}
                  </td>
                  <td
                    className="px-5 py-3.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/quotes/${q.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                      {q.estado === 'BORRADOR' && (
                        <>
                          <Link to={`/quotes/${q.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(q)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Eliminar
                          </Button>
                        </>
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