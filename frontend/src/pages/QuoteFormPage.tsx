import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCustomers } from '../api/customers';
import { listAssetsByCustomer } from '../api/assets';
import { getQuote, createQuote, updateQuote } from '../api/quotes';
import type { QuoteItemRequest } from '../types/quote';

interface ItemRow {
  descripcion: string;
  cantidad: string;       // string en UI, se convierte a number al guardar
  precioUnitario: string;
}

const EMPTY_ITEM: ItemRow = {
  descripcion: '',
  cantidad: '1',
  precioUnitario: '',
};

export default function QuoteFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const quoteId = id ? Number(id) : null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState<number | ''>('');
  const [assetId, setAssetId] = useState<number | ''>('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ITEM }]);

  // --- Cargar cotización si estamos editando ---
  const { data: existingQuote } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => getQuote(quoteId!),
    enabled: isEditing && quoteId !== null && !isNaN(quoteId),
  });

  useEffect(() => {
    if (existingQuote) {
      setCustomerId(existingQuote.customerId);
      setAssetId(existingQuote.assetId ?? '');
      setNotas(existingQuote.notas ?? '');
      setItems(
        existingQuote.items.map((it) => ({
          descripcion: it.descripcion,
          cantidad: String(it.cantidad),
          precioUnitario: String(it.precioUnitario),
        }))
      );
    }
  }, [existingQuote]);

  // --- Cargar clientes ---
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers(),
  });

  // --- Cargar assets del cliente seleccionado ---
  const { data: assets } = useQuery({
    queryKey: ['assets', customerId],
    queryFn: () => listAssetsByCustomer(Number(customerId)),
    enabled: customerId !== '',
  });

  // --- Mutación crear/actualizar ---
  const mutation = useMutation({
    mutationFn: (payload: {
      customerId: number;
      assetId: number | null;
      notas: string | null;
      items: QuoteItemRequest[];
    }) =>
      isEditing ? updateQuote(quoteId!, payload) : createQuote(payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', saved.id] });
      navigate(`/quotes/${saved.id}`);
    },
    onError: (err) => alert((err as Error).message),
  });

  // --- Cálculo del total en vivo ---
  const total = items.reduce((sum, it) => {
    const c = parseFloat(it.cantidad);
    const p = parseFloat(it.precioUnitario);
    if (isNaN(c) || isNaN(p)) return sum;
    return sum + c * p;
  }, 0);

  // --- Handlers de ítems ---
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

  // --- Submit ---
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (customerId === '') {
      alert('Debes seleccionar un cliente');
      return;
    }

    const parsedItems: QuoteItemRequest[] = items
      .map((it) => ({
        descripcion: it.descripcion.trim(),
        cantidad: parseFloat(it.cantidad),
        precioUnitario: parseFloat(it.precioUnitario),
      }))
      .filter((it) => it.descripcion && !isNaN(it.cantidad) && !isNaN(it.precioUnitario));

    if (parsedItems.length === 0) {
      alert('Debes agregar al menos un ítem con descripción, cantidad y precio válidos');
      return;
    }

    mutation.mutate({
      customerId: Number(customerId),
      assetId: assetId === '' ? null : Number(assetId),
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
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? `Editar cotización` : 'Nueva cotización'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Sección superior --- */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value === '' ? '' : Number(e.target.value));
                  setAssetId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Seleccionar cliente —</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehículo / Equipo
              </label>
              <select
                value={assetId}
                onChange={(e) =>
                  setAssetId(e.target.value === '' ? '' : Number(e.target.value))
                }
                disabled={customerId === ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Sin vehículo específico —</option>
                {assets?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {[a.marca, a.modelo, a.placaSerial && `(${a.placaSerial})`]
                      .filter(Boolean)
                      .join(' ') || `Asset #${a.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones, condiciones, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* --- Tabla de ítems --- */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Ítems</h2>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">
                  Descripción
                </th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 w-24">
                  Cantidad
                </th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700 w-32">
                  Precio unitario
                </th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700 w-32">
                  Subtotal
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const c = parseFloat(it.cantidad);
                const p = parseFloat(it.precioUnitario);
                const subtotal = !isNaN(c) && !isNaN(p) ? c * p : 0;

                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={it.descripcion}
                        onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                        placeholder="Ej: Cambio de aceite"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={it.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.precioUnitario}
                        onChange={(e) => updateItem(idx, 'precioUnitario', e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-800 font-medium">
                      {formatMoney(subtotal)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                          title="Eliminar línea"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-6 py-3 border-t border-gray-200">
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Agregar línea
            </button>
          </div>
        </div>

        {/* --- Total --- */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">Total:</span>
          <span className="text-3xl font-bold text-blue-600">
            {formatMoney(total)}
          </span>
        </div>

        {/* --- Botones --- */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cotización'}
          </button>
        </div>
      </form>
    </div>
  );
}