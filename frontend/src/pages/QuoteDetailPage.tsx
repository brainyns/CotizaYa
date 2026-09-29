import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Pencil, Trash2, Wrench } from 'lucide-react';
import { getQuote, changeQuoteStatus, deleteQuote } from '../api/quotes';
import type { QuoteStatus } from '../types/quote';
import { QuoteStatusBadge } from '../components/QuoteStatusBadge';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          ID de cotización inválido
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando cotización...
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          Error: {(error as Error)?.message || 'Cotización no encontrada'}
        </div>
      </div>
    );
  }

  const puedeEnviar = quote.estado === 'BORRADOR';
  const puedeAprobarRechazar = quote.estado === 'ENVIADA';
  const esBorrador = quote.estado === 'BORRADOR';
  const esAprobada = quote.estado === 'APROBADA';

  return (
    <div className="p-6 w-full">
      <Link
        to="/quotes"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cotizaciones
      </Link>

      {/* --- Cabecera --- */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
                {quote.numero}
              </h1>
              <QuoteStatusBadge status={quote.estado} />
            </div>
            <div className="flex gap-2">
              <a
                href={`http://localhost:8080/api/quotes/${quote.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary">
                  <Download className="w-4 h-4" />
                  Ver PDF
                </Button>
              </a>
              {esBorrador && (
                <>
                  <Link to={`/quotes/${quote.id}/edit`}>
                    <Button variant="secondary">
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 mb-1">Cliente</div>
              <Link
                to={`/customers/${quote.customerId}`}
                className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                {quote.customerNombre}
              </Link>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 mb-1">
                Vehículo / Equipo
              </div>
              <div className="text-zinc-900 dark:text-zinc-100">
                {quote.assetDescripcion || '—'}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 mb-1">Creada</div>
              <div className="text-zinc-900 dark:text-zinc-100">
                {formatDate(quote.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 mb-1">
                Última actualización
              </div>
              <div className="text-zinc-900 dark:text-zinc-100">
                {formatDate(quote.updatedAt)}
              </div>
            </div>
          </div>

          {quote.notas && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-1">
                Notas
              </div>
              <div className="text-zinc-700 dark:text-zinc-300 italic text-sm">
                {quote.notas}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* --- Ítems --- */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Ítems
          </h2>
        </CardHeader>
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">
                Cantidad
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">
                Precio
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((it) => (
              <tr
                key={it.id}
                className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <td className="px-5 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">
                  {it.descripcion}
                </td>
                <td className="px-5 py-3.5 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {it.cantidad}
                </td>
                <td className="px-5 py-3.5 text-right text-sm text-zinc-600 dark:text-zinc-400">
                  {formatMoney(it.precioUnitario)}
                </td>
                <td className="px-5 py-3.5 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatMoney(it.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-300 dark:border-zinc-700">
            <tr>
              <td
                colSpan={3}
                className="px-5 py-4 text-right font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Total
              </td>
              <td className="px-5 py-4 text-right text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatMoney(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* --- Acciones de estado --- */}
      {(puedeEnviar || puedeAprobarRechazar) && (
        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Acciones
            </h3>
            <div className="flex flex-wrap gap-2">
              {puedeEnviar && (
                <Button
                  onClick={() => statusMutation.mutate('ENVIADA')}
                  disabled={statusMutation.isPending}
                >
                  Marcar como enviada
                </Button>
              )}
              {puedeAprobarRechazar && (
                <>
                  <Button
                    onClick={() => statusMutation.mutate('APROBADA')}
                    disabled={statusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
                  >
                    ✓ Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => statusMutation.mutate('RECHAZADA')}
                    disabled={statusMutation.isPending}
                  >
                    × Rechazar
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* --- Generar OT si está aprobada --- */}
      {esAprobada && (
        <Card className="mt-6">
          <CardBody>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Acciones
            </h3>
            <Link to={`/work-orders/new?quoteId=${quote.id}`}>
              <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500">
                <Wrench className="w-4 h-4" />
                Generar orden de trabajo
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* --- Estado final --- */}
      {(quote.estado === 'APROBADA' || quote.estado === 'RECHAZADA') && (
        <Card className="mt-6">
          <CardBody>
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Esta cotización está en estado final ({quote.estado.toLowerCase()}) y no admite más cambios.
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}