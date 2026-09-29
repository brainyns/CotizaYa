import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Info } from 'lucide-react';
import { listCustomers } from '../api/customers';
import { listAssetsByCustomer } from '../api/assets';
import { getWorkOrder, createWorkOrder, updateWorkOrder } from '../api/workOrders';
import { getQuote } from '../api/quotes';
import type { WorkOrderItemRequest } from '../types/workOrder';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select, Label } from '../components/ui/Input';

interface ItemRow {
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
}

const EMPTY_ITEM: ItemRow = {
  descripcion: '',
  cantidad: '1',
  precioUnitario: '',
};

export default function WorkOrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const quoteIdParam = searchParams.get('quoteId');

  const isEditing = Boolean(id);
  const woId = id ? Number(id) : null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState<number | ''>('');
  const [assetId, setAssetId] = useState<number | ''>('');
  const [quoteId, setQuoteId] = useState<number | ''>('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ITEM }]);

  const { data: existingWO } = useQuery({
    queryKey: ['work-order', woId],
    queryFn: () => getWorkOrder(woId!),
    enabled: isEditing && woId !== null && !isNaN(woId),
  });

  useEffect(() => {
    if (existingWO) {
      setCustomerId(existingWO.customerId);
      setAssetId(existingWO.assetId ?? '');
      setQuoteId(existingWO.quoteId ?? '');
      setNotas(existingWO.notas ?? '');
      setItems(
        existingWO.items.map((it) => ({
          descripcion: it.descripcion,
          cantidad: String(it.cantidad),
          precioUnitario: String(it.precioUnitario),
        }))
      );
    }
  }, [existingWO]);

  const { data: sourceQuote } = useQuery({
    queryKey: ['quote', quoteIdParam],
    queryFn: () => getQuote(Number(quoteIdParam)),
    enabled: !isEditing && quoteIdParam !== null && !isNaN(Number(quoteIdParam)),
  });

  useEffect(() => {
    if (sourceQuote && !isEditing) {
      setCustomerId(sourceQuote.customerId);
      setAssetId(sourceQuote.assetId ?? '');
      setQuoteId(sourceQuote.id);
      setNotas(sourceQuote.notas ?? '');
      setItems(
        sourceQuote.items.map((it) => ({
          descripcion: it.descripcion,
          cantidad: String(it.cantidad),
          precioUnitario: String(it.precioUnitario),
        }))
      );
    }
  }, [sourceQuote, isEditing]);

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers(),
  });

  const { data: assets } = useQuery({
    queryKey: ['assets', customerId],
    queryFn: () => listAssetsByCustomer(Number(customerId)),
    enabled: customerId !== '',
  });

  const mutation = useMutation({
    mutationFn: (payload: {
      customerId: number;
      assetId: number | null;
      quoteId: number | null;
      notas: string | null;
      items: WorkOrderItemRequest[];
    }) => (isEditing ? updateWorkOrder(woId!, payload) : createWorkOrder(payload)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', saved.id] });
      navigate(`/work-orders/${saved.id}`);
    },
    onError: (err) => alert((err as Error).message),
  });

  const total = items.reduce((sum, it) => {
    const c = parseFloat(it.cantidad);
    const p = parseFloat(it.precioUnitario);
    if (isNaN(c) || isNaN(p)) return sum;
    return sum + c * p;
  }, 0);

  function updateItem(idx: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (customerId === '') {
      alert('Debes seleccionar un cliente');
      return;
    }

    const parsedItems: WorkOrderItemRequest[] = items
      .map((it) => ({
        descripcion: it.descripcion.trim(),
        cantidad: parseFloat(it.cantidad),
        precioUnitario: parseFloat(it.precioUnitario),
      }))
      .filter(
        (it) => it.descripcion && !isNaN(it.cantidad) && !isNaN(it.precioUnitario)
      );

    if (parsedItems.length === 0) {
      alert('Debes agregar al menos un ítem');
      return;
    }

    mutation.mutate({
      customerId: Number(customerId),
      assetId: assetId === '' ? null : Number(assetId),
      quoteId: quoteId === '' ? null : Number(quoteId),
      notas: notas.trim() || null,
      items: parsedItems,
    });
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="p-6 w-full max-w-4xl">
      <Link
        to="/work-orders"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6">
        {isEditing ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'}
      </h1>

      {sourceQuote && !isEditing && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-400 px-4 py-3 rounded-md mb-6 text-sm flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            Precargado desde la cotización <strong>{sourceQuote.numero}</strong>. Puedes ajustar los ítems si el trabajo real difiere de lo cotizado.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente *</Label>
                <Select
                  required
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value === '' ? '' : Number(e.target.value));
                    setAssetId('');
                  }}
                >
                  <option value="">— Seleccionar cliente —</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Vehículo / Equipo</Label>
                <Select
                  value={assetId}
                  onChange={(e) =>
                    setAssetId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  disabled={customerId === ''}
                >
                  <option value="">— Sin vehículo específico —</option>
                  {assets?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {[a.marca, a.modelo, a.placaSerial && `(${a.placaSerial})`]
                        .filter(Boolean)
                        .join(' ') || `Asset #${a.id}`}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones, trabajo a realizar, condiciones, etc."
              />
            </div>

            {quoteId !== '' && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Vinculada a la cotización #{quoteId}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Ítems
            </h2>
          </CardHeader>

          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">
                  Cantidad
                </th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">
                  Precio
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">
                  Subtotal
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const c = parseFloat(it.cantidad);
                const p = parseFloat(it.precioUnitario);
                const subtotal = !isNaN(c) && !isNaN(p) ? c * p : 0;

                return (
                  <tr
                    key={idx}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-2">
                      <Input
                        type="text"
                        value={it.descripcion}
                        onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                        placeholder="Ej: Cambio de aceite"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={it.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.precioUnitario}
                        onChange={(e) => updateItem(idx, 'precioUnitario', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatMoney(subtotal)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Agregar línea
            </button>
          </div>
        </Card>

        <Card>
          <CardBody className="flex items-center justify-between">
            <span className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
              Total
            </span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatMoney(total)}
            </span>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Guardando...'
              : isEditing
              ? 'Guardar cambios'
              : 'Crear orden'}
          </Button>
        </div>
      </form>
    </div>
  );
}