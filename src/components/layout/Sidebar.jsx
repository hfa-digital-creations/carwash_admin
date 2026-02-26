// ============================================
// FILE: src/components/layout/Sidebar.jsx
// ============================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, ShoppingCart, Package, Wrench, 
  TicketPercent, Settings, X 
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/services', label: 'Services', icon: Wrench },
  { path: '/vouchers', label: 'Vouchers', icon: TicketPercent },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
  fixed lg:static inset-y-0 left-0 z-30
  w-screen lg:w-64 bg-white border-r border-gray-200
  transform transition-transform duration-300 ease-in-out
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FF6B1A] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Scroosh</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-[#FF6B1A] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  end={item.path === '/'}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Scroosh. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  ); 
}