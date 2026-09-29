import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Upload, X } from 'lucide-react';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from '../api/businessSettings';
import type { BusinessSettingsRequest } from '../types/businessSettings';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Label } from '../components/ui/Input';

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

    if (file.size > 500 * 1024) {
      alert('El logo no debe pesar más de 500 KB');
      return;
    }
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
      <div className="p-6 w-full max-w-3xl">
        <Card>
          <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando configuración...
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 w-full max-w-3xl">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          Error: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Configuración del taller
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Estos datos aparecerán en las cotizaciones y órdenes impresas o enviadas en PDF.
        </p>
      </div>

      {savedMessage && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-4 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          Configuración guardada
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Datos del taller
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <Label>Nombre del taller *</Label>
              <Input
                type="text"
                required
                value={form.nombreTaller}
                onChange={(e) => setForm({ ...form, nombreTaller: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>NIT / Cédula</Label>
                <Input
                  type="text"
                  value={form.nit ?? ''}
                  onChange={(e) => setForm({ ...form, nit: e.target.value })}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  type="text"
                  value={form.telefono ?? ''}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dirección</Label>
                <Input
                  type="text"
                  value={form.direccion ?? ''}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input
                  type="text"
                  value={form.ciudad ?? ''}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Logo
            </h2>
          </CardHeader>
          <CardBody>
            {form.logoBase64 ? (
              <div className="flex items-start gap-4">
                <img
                  src={form.logoBase64}
                  alt="Logo del taller"
                  className="max-h-32 max-w-32 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={removeLogo}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <X className="w-4 h-4" />
                  Quitar logo
                </Button>
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  <Upload className="w-5 h-5 text-zinc-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Subir logo
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      PNG, JPG · Máximo 500 KB
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Notas al pie del PDF
            </h2>
          </CardHeader>
          <CardBody>
            <Textarea
              rows={4}
              value={form.notasPie ?? ''}
              onChange={(e) => setForm({ ...form, notasPie: e.target.value })}
              placeholder="Ej: Garantía de 30 días en mano de obra. Los repuestos tienen garantía del fabricante."
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Estas notas aparecen al final de cada cotización u orden impresa.
            </p>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}