import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, updateCustomer } from '../api/customers';
import type { Customer, CustomerRequest } from '../types/customer';

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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