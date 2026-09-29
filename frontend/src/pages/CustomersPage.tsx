import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Car } from 'lucide-react';
import { listCustomers, deleteCustomer } from '../api/customers';
import type { Customer } from '../types/customer';
import { CustomerForm } from '../components/CustomerForm';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

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
    <div className="p-6 w-full">
      <PageHeader
        title="Clientes"
        description="Gestiona tu cartera de clientes"
        action={
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </Button>
        }
      />

      {/* Buscador */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Estados */}
      {isLoading && (
        <Card>
          <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Cargando clientes...
          </div>
        </Card>
      )}

      {isError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          Error: {(error as Error).message}
        </div>
      )}

      {data && data.length === 0 && (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? 'Sin resultados' : 'Aún no hay clientes'}
            description={
              search
                ? `No se encontraron clientes que coincidan con "${search}"`
                : 'Crea tu primer cliente para empezar a cotizar'
            }
            action={
              !search && (
                <Button onClick={handleNew} size="sm">
                  <Plus className="w-4 h-4" />
                  Nuevo cliente
                </Button>
              )
            }
          />
        </Card>
      )}

      {data && data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/customers/${c.id}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.telefono || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.email || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/customers/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          <Car className="w-4 h-4" />
                          Vehículos
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c)}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {formOpen && (
        <CustomerForm customer={editing} onClose={handleCloseForm} />
      )}
    </div>
  );
}