import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuote, changeQuoteStatus, deleteQuote } from '../api/quotes';
import type { Quote, QuoteStatus } from '../types/quote';
import { QuoteStatusBadge } from '../components/QuoteStatusBadge';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const quoteId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quote, isLoading, isError, error } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuote(quoteId),
    enabled: !isNaN(quoteId),
  });

  const statusMutation = useMutation({
    mutationFn: (estado: QuoteStatus) => changeQuoteStatus(quoteId, estado),
    onSuccess: (updated) => {
      queryClient.setQueryData(['quote', quoteId], updated);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (err) => alert((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      navigate('/quotes');
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleDelete() {
    if (quote && confirm(`¿Eliminar la cotización ${quote.numero}?`)) {
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

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isNaN(quoteId)) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ID de cotización inválido
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-gray-500">
        Cargando cotización...
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error)?.message || 'Cotización no encontrada'}
        </div>
      </div>
    );
  }

  const puedeEnviar = quote.estado === 'BORRADOR';
  const puedeAprobarRechazar = quote.estado === 'ENVIADA';
  const esBorrador = quote.estado === 'BORRADOR';

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link
        to="/quotes"
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
      >
        ← Volver a cotizaciones
      </Link>

      {/* --- Cabecera --- */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{quote.numero}</h1>
            <QuoteStatusBadge status={quote.estado} />
          </div>
          <div className="flex gap-2">
            {esBorrador && (
              <>
                <Link
                  to={`/quotes/${quote.id}/edit`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Cliente</div>
            <div className="text-gray-800 font-medium">{quote.customerNombre}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Vehículo / Equipo</div>
            <div className="text-gray-800">{quote.assetDescripcion || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Creada</div>
            <div className="text-gray-800">{formatDate(quote.createdAt)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Última actualización</div>
            <div className="text-gray-800">{formatDate(quote.updatedAt)}</div>
          </div>
        </div>

        {quote.notas && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-gray-500 text-sm mb-1">Notas</div>
            <div className="text-gray-700 italic">{quote.notas}</div>
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
            {quote.items.map((it) => (
              <tr key={it.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-800">{it.descripcion}</td>
                <td className="px-4 py-3 text-right text-gray-600">{it.cantidad}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatMoney(it.precioUnitario)}</td>
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
                {formatMoney(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- Acciones de estado --- */}
      {(puedeEnviar || puedeAprobarRechazar) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones</h3>
          <div className="flex gap-3">
            {puedeEnviar && (
              <button
                onClick={() => statusMutation.mutate('ENVIADA')}
                disabled={statusMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                Marcar como enviada
              </button>
            )}
            {puedeAprobarRechazar && (
              <>
                <button
                  onClick={() => statusMutation.mutate('APROBADA')}
                  disabled={statusMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => statusMutation.mutate('RECHAZADA')}
                  disabled={statusMutation.isPending}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  × Rechazar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- Estado final --- */}
      {(quote.estado === 'APROBADA' || quote.estado === 'RECHAZADA') && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Esta cotización está en estado final ({quote.estado.toLowerCase()}) y no admite más cambios.
        </div>
      )}
    </div>
  );
}