import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
    }`;

  return (
    <div className="h-full flex bg-white dark:bg-zinc-950">
      {/* --- Sidebar --- */}
<aside className="w-56 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            CotizaYa
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
            Gestión de taller
          </p>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </NavLink>
          <NavLink to="/customers" className={linkClass}>
            <Users className="w-4 h-4 shrink-0" />
            Clientes
          </NavLink>
          <NavLink to="/quotes" className={linkClass}>
            <FileText className="w-4 h-4 shrink-0" />
            Cotizaciones
          </NavLink>
          <NavLink to="/work-orders" className={linkClass}>
            <Wrench className="w-4 h-4 shrink-0" />
            Órdenes de trabajo
          </NavLink>
        </nav>

        {/* Footer: theme toggle + settings */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 shrink-0" />
                Modo claro
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 shrink-0" />
                Modo oscuro
              </>
            )}
          </button>
          <NavLink to="/settings" className={linkClass}>
            <Settings className="w-4 h-4 shrink-0" />
            Configuración
          </NavLink>
        </div>
      </aside>

      {/* --- Contenido principal --- */}
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
        <Outlet />
      </main>
    </div>
  );
}