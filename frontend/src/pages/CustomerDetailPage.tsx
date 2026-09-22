import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomer } from '../api/customers';
import { listAssetsByCustomer, deleteAsset } from '../api/assets';
import { ASSET_TYPE_LABELS } from '../types/asset';
import type { Asset } from '../types/asset';
import { AssetForm } from '../components/AssetForm';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);

  const queryClient = useQueryClient();

  const {
    data: customer,
    isLoading: loadingCustomer,
    isError: errorCustomer,
    error: customerError,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomer(customerId),
    enabled: !isNaN(customerId),
  });

  const {
    data: assets,
    isLoading: loadingAssets,
    isError: errorAssets,
    error: assetsError,
  } = useQuery({
    queryKey: ['assets', customerId],
    queryFn: () => listAssetsByCustomer(customerId),
    enabled: !isNaN(customerId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', customerId] });
    },
  });

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(asset: Asset) {
    setEditing(asset);
    setFormOpen(true);
  }

  function handleDelete(asset: Asset) {
    const label = asset.placaSerial || asset.modelo || 'este vehículo';
    if (confirm(`¿Eliminar ${label}?`)) {
      deleteMutation.mutate(asset.id);
    }
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditing(null);
  }

  if (isNaN(customerId)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">ID de cliente inválido</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Volver a clientes
        </Link>

        {loadingCustomer && (
          <div className="text-center py-10 text-gray-500">Cargando cliente...</div>
        )}

        {errorCustomer && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {(customerError as Error).message}
          </div>
        )}

        {customer && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {customer.nombre}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                {customer.telefono && <div>📞 {customer.telefono}</div>}
                {customer.email && <div>✉️ {customer.email}</div>}
                {customer.notas && (
                  <div className="mt-2 text-gray-500 italic">{customer.notas}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Vehículos / Equipos</h2>
              <button
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                + Nuevo vehículo
              </button>
            </div>

            {loadingAssets && (
              <div className="text-center py-10 text-gray-500">Cargando vehículos...</div>
            )}

            {errorAssets && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {(assetsError as Error).message}
              </div>
            )}

            {assets && assets.length === 0 && (
              <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
                Este cliente no tiene vehículos todavía.
              </div>
            )}

            {assets && assets.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Marca / Modelo</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Placa / Serial</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Año</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">
                          {ASSET_TYPE_LABELS[a.tipo]}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {[a.marca, a.modelo].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {a.placaSerial || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {a.anio ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {formOpen && (
        <AssetForm
          customerId={customerId}
          asset={editing}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}