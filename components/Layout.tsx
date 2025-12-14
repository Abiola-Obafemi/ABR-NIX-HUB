import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  Trophy, 
  Menu, 
  X,
  Zap,
  Map as MapIcon,
  Crown
} from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'War Room', path: '/gameplan', icon: MapIcon },
    { name: 'Coach ABØ', path: '/coach', icon: MessageSquare },
    { name: 'Routine Gen', path: '/routine', icon: Zap },
    { name: 'Weakness Tracker', path: '/weaknesses', icon: Target },
    { name: 'Journal', path: '/journal', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-900 bg-neutral-950">
        <div className="p-6 border-b border-neutral-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -skew-x-12">
            <Crown className="w-5 h-5 text-white transform skew-x-12" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-white brand-font tracking-widest">
            ABRØNIX
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium ${
                  isActive
                    ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                    : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-900">
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 text-center">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Developed by</p>
            <p className="text-sm font-bold text-red-500 brand-font">ABØ</p>
            <p className="text-[10px] text-neutral-600 mt-2 italic">"For Gamers, By Gamers"</p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm md:hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-white brand-font">ABRØNIX HUB</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-400">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${
                    isActive ? 'bg-red-600/20 text-red-500 border border-red-600/20' : 'text-neutral-400'
                  }`
                }
              >
                <item.icon className="w-6 h-6" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-black">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-neutral-900 flex items-center justify-between px-4 bg-black/80 backdrop-blur-md sticky top-0 z-40">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center transform -skew-x-12">
                <Crown className="w-4 h-4 text-white transform skew-x-12" fill="currentColor" />
              </div>
              <span className="font-bold text-white brand-font tracking-wider">ABRØNIX</span>
            </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-neutral-300">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;