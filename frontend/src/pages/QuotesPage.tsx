import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listQuotes, deleteQuote } from '../api/quotes';
import type { Quote, QuoteStatus } from '../types/quote';
import { QuoteStatusBadge } from '../components/QuoteStatusBadge';
import { QUOTE_STATUS_LABELS } from '../types/quote';

const FILTROS_ESTADO: (QuoteStatus | 'TODAS')[] = [
  'TODAS',
  'BORRADOR',
  'ENVIADA',
  'APROBADA',
  'RECHAZADA',
];

export default function QuotesPage() {
  const [filtroEstado, setFiltroEstado] = useState<QuoteStatus | 'TODAS'>('TODAS');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quotes', filtroEstado],
    queryFn: () =>
      listQuotes(filtroEstado === 'TODAS' ? undefined : { estado: filtroEstado }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  function handleDelete(quote: Quote) {
    if (confirm(`¿Eliminar la cotización ${quote.numero}?`)) {
      deleteMutation.mutate(quote.id, {
        onError: (err) => alert((err as Error).message),
      });
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
        <Link
          to="/quotes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          + Nueva cotización
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
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
            {f === 'TODAS' ? 'Todas' : QUOTE_STATUS_LABELS[f]}
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
          No hay cotizaciones con este filtro.
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
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fecha</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/quotes/${q.id}`)}
                >
                  <td className="px-4 py-3 text-gray-800 font-medium">{q.numero}</td>
                  <td className="px-4 py-3 text-gray-600">{q.customerNombre}</td>
                  <td className="px-4 py-3 text-gray-600">{q.assetDescripcion || '—'}</td>
                  <td className="px-4 py-3">
                    <QuoteStatusBadge status={q.estado} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800 font-medium">
                    {formatMoney(q.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(q.createdAt)}</td>
                  <td
                    className="px-4 py-3 text-right space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/quotes/${q.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver
                    </Link>
                    {q.estado === 'BORRADOR' && (
                      <>
                        <Link
                          to={`/quotes/${q.id}/edit`}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(q)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </>
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