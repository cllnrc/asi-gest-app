/**
 * ASI-GEST Layout Component
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/commesse', label: 'Commesse' },
    { path: '/lotti', label: 'Lotti' },
    { path: '/smd', label: 'SMD' },
    { path: '/pth', label: 'PTH' },
    { path: '/collaudo', label: 'Collaudo' },
    { path: '/reporting', label: 'Report' },
    { path: '/utenti', label: 'Utenti' },
    { path: '/macchine', label: 'Macchine' },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Ultra-compact header - h-10 */}
      <header className="h-10 bg-blue-600 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold">ASI-GEST</h1>
          <span className="text-[10px] opacity-75">Produzione Elettronica</span>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1 text-[10px] font-medium rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-blue-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-[10px] opacity-75">
          {new Date().toLocaleDateString('it-IT')}
        </div>
      </header>

      {/* Main content area - fill remaining height */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
