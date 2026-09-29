import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from '../api/businessSettings';
import type { BusinessSettingsRequest } from '../types/businessSettings';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BusinessSettingsRequest>({
    nombreTaller: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    notasPie: '',
    logoBase64: null,
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['business-settings'],
    queryFn: getBusinessSettings,
  });

  useEffect(() => {
    if (data) {
      setForm({
        nombreTaller: data.nombreTaller,
        nit: data.nit ?? '',
        telefono: data.telefono ?? '',
        email: data.email ?? '',
        direccion: data.direccion ?? '',
        ciudad: data.ciudad ?? '',
        notasPie: data.notasPie ?? '',
        logoBase64: data.logoBase64,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(['business-settings'], updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      nombreTaller: form.nombreTaller.trim(),
      nit: form.nit?.trim() || null,
      telefono: form.telefono?.trim() || null,
      email: form.email?.trim() || null,
      direccion: form.direccion?.trim() || null,
      ciudad: form.ciudad?.trim() || null,
      notasPie: form.notasPie?.trim() || null,
      logoBase64: form.logoBase64,
    });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 500 KB)
    if (file.size > 500 * 1024) {
      alert('El logo no debe pesar más de 500 KB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setForm((prev) => ({ ...prev, logoBase64: null }));
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-gray-500">
        Cargando configuración...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración del taller</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Estos datos aparecerán en las cotizaciones y órdenes impresas o enviadas en PDF.
      </p>

      {savedMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✓ Configuración guardada
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Datos básicos --- */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Datos del taller</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del taller *
            </label>
            <input
              type="text"
              required
              value={form.nombreTaller}
              onChange={(e) => setForm({ ...form, nombreTaller: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT / Cédula
              </label>
              <input
                type="text"
                value={form.nit ?? ''}
                onChange={(e) => setForm({ ...form, nit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={form.telefono ?? ''}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={form.direccion ?? ''}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={form.ciudad ?? ''}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* --- Logo --- */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Logo</h2>

          {form.logoBase64 ? (
            <div className="flex items-start gap-4">
              <img
                src={form.logoBase64}
                alt="Logo del taller"
                className="max-h-32 max-w-32 border border-gray-200 rounded-md p-2 bg-white"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Quitar logo
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-2">
                Máximo 500 KB. Recomendado: PNG o JPG con fondo transparente.
              </p>
            </div>
          )}
        </div>

        {/* --- Notas al pie --- */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Notas al pie del PDF
          </h2>
          <textarea
            rows={4}
            value={form.notasPie ?? ''}
            onChange={(e) => setForm({ ...form, notasPie: e.target.value })}
            placeholder="Ej: Garantía de 30 días en mano de obra. Los repuestos tienen garantía del fabricante."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            Estas notas aparecen al final de cada cotización u orden impresa.
          </p>
        </div>

        {/* --- Botones --- */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}