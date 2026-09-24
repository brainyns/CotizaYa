import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">CotizaYa</h1>
          <p className="text-xs text-gray-500 mt-1">Gestion de taller</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <NavLink to="/" end className={linkClass}>
            👥 Clientes
          </NavLink>
          <NavLink to="/quotes" className={linkClass}>
            📄 Cotizaciones
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}