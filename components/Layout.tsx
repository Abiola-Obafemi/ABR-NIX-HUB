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
  Crown,
  RefreshCw,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncString, setSyncString] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  
  const { exportData, importData } = useUser();

  const handleExport = () => {
    const data = exportData();
    setSyncString(data);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(syncString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!syncString) return;
    const success = importData(syncString);
    setImportStatus(success ? 'success' : 'error');
    if (success) {
        setTimeout(() => {
            setShowSyncModal(false);
            setImportStatus('idle');
            setSyncString('');
        }, 1500);
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
      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 brand-font">
                        <RefreshCw className="w-5 h-5 text-red-600" /> SYNC DATA
                    </h2>
                    <button onClick={() => setShowSyncModal(false)} className="text-neutral-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleExport}
                            className="p-4 bg-black border border-neutral-800 rounded-lg hover:border-red-600/50 transition-colors flex flex-col items-center gap-2"
                        >
                            <Download className="w-6 h-6 text-red-500" />
                            <span className="font-bold text-sm">Export Data</span>
                            <span className="text-xs text-neutral-500 text-center">Get code to move to another device</span>
                        </button>
                         <button 
                            onClick={() => { setSyncString(''); setImportStatus('idle'); }}
                            className="p-4 bg-black border border-neutral-800 rounded-lg hover:border-blue-600/50 transition-colors flex flex-col items-center gap-2"
                        >
                            <RefreshCw className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-sm">Import Data</span>
                            <span className="text-xs text-neutral-500 text-center">Paste code from another device</span>
                        </button>
                    </div>

                    <div className="bg-black p-4 rounded-lg border border-neutral-800">
                        <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Sync Code</label>
                        <textarea 
                            value={syncString}
                            onChange={(e) => setSyncString(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-300 font-mono h-32 focus:outline-none focus:border-red-600 resize-none"
                            placeholder="Generate export code or paste import code here..."
                        />
                        <div className="flex justify-end mt-2 gap-2">
                            {syncString && (
                                <>
                                    <button onClick={handleCopy} className="text-xs font-bold flex items-center gap-1 text-neutral-400 hover:text-white px-3 py-1 bg-neutral-800 rounded">
                                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'COPIED' : 'COPY'}
                                    </button>
                                    <button onClick={handleImport} className={`text-xs font-bold flex items-center gap-1 text-white px-3 py-1 rounded transition-colors ${
                                        importStatus === 'success' ? 'bg-green-600' : importStatus === 'error' ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
                                    }`}>
                                        {importStatus === 'success' ? 'SUCCESS!' : importStatus === 'error' ? 'INVALID CODE' : 'LOAD DATA'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

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
          <button 
            onClick={() => setShowSyncModal(true)}
            className="w-full py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-sm hover:text-white hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Devices
          </button>

          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 text-center">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Developed by</p>
            <p className="text-sm font-bold text-red-500 brand-font">ABØ</p>
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
             <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowSyncModal(true); }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg text-neutral-400 hover:text-white"
            >
                <RefreshCw className="w-6 h-6" />
                Sync Devices
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