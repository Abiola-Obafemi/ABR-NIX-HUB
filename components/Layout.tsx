import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  Trophy, 
  Menu, 
  X,
  Zap,
  Map as MapIcon,
  Crown,
  LogOut,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useUser();
  
  const handleSignOut = async () => {
      try {
          await signOut(auth);
          // Optional: clear local storage if you want strict logout
          navigate('/login');
      } catch (error) {
          console.error("Sign out error", error);
      }
  };

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

        <div className="p-4 border-t border-neutral-900 space-y-4">
          {currentUser ? (
              <div className="flex items-center gap-3 px-2 mb-2">
                 <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <UserIcon className="w-4 h-4" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1 text-[10px] text-green-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Cloud Sync Active
                    </div>
                 </div>
              </div>
          ) : (
             <div className="flex items-center gap-2 text-[10px] text-neutral-500 px-2 mb-2">
                 <RefreshCw className="w-3 h-3" />
                 Offline Mode
             </div>
          )}

          <button 
            onClick={handleSignOut}
            className="w-full py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-sm hover:text-white hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
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
             <button 
                onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg text-neutral-400 hover:text-white"
            >
                <LogOut className="w-6 h-6" />
                Sign Out
            </button>
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