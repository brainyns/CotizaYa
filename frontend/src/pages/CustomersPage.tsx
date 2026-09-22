import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCustomers, deleteCustomer } from '../api/customers';
import type { Customer } from '../types/customer';
import { CustomerForm } from '../components/CustomerForm';
import { Link } from 'react-router-dom';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => listCustomers(search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  function handleEdit(customer: Customer) {
    setEditing(customer);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleDelete(customer: Customer) {
    if (confirm(`¿Eliminar a ${customer.nombre}?`)) {
      deleteMutation.mutate(customer.id);
    }
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Nuevo cliente
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isLoading && (
          <div className="text-center py-10 text-gray-500">Cargando...</div>
        )}

        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {(error as Error).message}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No hay clientes todavía. Crea el primero.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Teléfono</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{c.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{c.telefono || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/customers/${c.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Ver vehículos
                      </Link>
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
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
      </div>

      {formOpen && (
        <CustomerForm
          customer={editing}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}