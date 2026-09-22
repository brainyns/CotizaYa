import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAsset, updateAsset } from '../api/assets';
import type { Asset, AssetRequest, AssetType } from '../types/asset';
import { ASSET_TYPE_LABELS } from '../types/asset';

interface Props {
  customerId: number;
  asset: Asset | null;
  onClose: () => void;
}

const TIPOS: AssetType[] = [
  'VEHICULO',
  'ELECTRODOMESTICO',
  'INMUEBLE',
  'EQUIPO',
  'OTRO',
];

export function AssetForm({ customerId, asset, onClose }: Props) {
  const isEditing = asset !== null;
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AssetRequest>({
    tipo: 'VEHICULO',
    marca: '',
    modelo: '',
    placaSerial: '',
    anio: null,
    notas: '',
  });

  useEffect(() => {
    if (asset) {
      setForm({
        tipo: asset.tipo,
        marca: asset.marca ?? '',
        modelo: asset.modelo ?? '',
        placaSerial: asset.placaSerial ?? '',
        anio: asset.anio ?? null,
        notas: asset.notas ?? '',
      });
    }
  }, [asset]);

  const mutation = useMutation({
    mutationFn: (data: AssetRequest) =>
      isEditing ? updateAsset(asset!.id, data) : createAsset(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', customerId] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      tipo: form.tipo,
      marca: form.marca || null,
      modelo: form.modelo || null,
      placaSerial: form.placaSerial || null,
      anio: form.anio ?? null,
      notas: form.notas || null,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar vehículo' : 'Nuevo vehículo'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              required
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as AssetType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {ASSET_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={form.marca ?? ''}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={form.modelo ?? ''}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa / Serial
              </label>
              <input
                type="text"
                value={form.placaSerial ?? ''}
                onChange={(e) =>
                  setForm({ ...form, placaSerial: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <input
                type="number"
                value={form.anio ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    anio: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              rows={3}
              value={form.notas ?? ''}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mutation.isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}