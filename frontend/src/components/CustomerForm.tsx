import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createCustomer, updateCustomer } from '../api/customers';
import type { Customer, CustomerRequest } from '../types/customer';
import { Button } from './ui/Button';
import { Input, Textarea, Label } from './ui/Input';

interface Props {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerForm({ customer, onClose }: Props) {
  const isEditing = customer !== null;
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CustomerRequest>({
    nombre: '',
    telefono: '',
    email: '',
    notas: '',
  });

  useEffect(() => {
    if (customer) {
      setForm({
        nombre: customer.nombre,
        telefono: customer.telefono ?? '',
        email: customer.email ?? '',
        notas: customer.notas ?? '',
      });
    }
  }, [customer]);

  const mutation = useMutation({
    mutationFn: (data: CustomerRequest) =>
      isEditing ? updateCustomer(customer!.id, data) : createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
    onError: (err) => alert((err as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      nombre: form.nombre,
      telefono: form.telefono || null,
      email: form.email || null,
      notas: form.notas || null,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              rows={3}
              value={form.notas ?? ''}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          {mutation.isError && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-3 py-2 rounded-md text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}