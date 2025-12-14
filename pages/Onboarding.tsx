import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Zap, Search, Edit2, ArrowRight, AlertTriangle, Crown } from 'lucide-react';
import { getRealStats } from '../services/fortniteApiService';
import { PlayerStats } from '../types';

const Onboarding: React.FC = () => {
  const { setUser } = useUser();
  const [step, setStep] = useState<'username' | 'verify' | 'manual'>('username');
  const [username, setUsername] = useState('');
  const [region, setRegion] = useState('NA-East');
  const [platform, setPlatform] = useState('PC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState<PlayerStats>({
    rank: 'Unranked',
    pr: 0,
    earnings: '$0',
    winRate: '0%',
    kd: '0.0',
    matches: '0'
  });

  const handleAutoDetect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setLoading(true);
    setError('');
    
    const fetchedStats = await getRealStats(username);
    
    setLoading(false);
    
    if (fetchedStats) {
        setStats(fetchedStats);
        setStep('verify');
    } else {
        setError("Could not retrieve stats automatically. Please enter them manually.");
        setStep('manual');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      username,
      region,
      platform,
      stats
    });
  };

  const updateStat = (field: keyof PlayerStats, value: string | number) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neutral-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-2xl shadow-red-600/20 transform rotate-3 hover:rotate-0 transition-transform">
            <Crown className="w-10 h-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-bold text-white brand-font tracking-tight">
            ABRØNIX <span className="text-red-600">HUB</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Made by <span className="text-red-500 font-bold">ABØ</span> for Gamers
          </p>
        </div>

        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          
          {step === 'username' && (
            <form onSubmit={handleAutoDetect} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-neutral-400">Epic Games Username</label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ABRØNIX"
                  className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-white focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder:text-neutral-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-neutral-400">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-white appearance-none"
                  >
                    <option>NA-East</option>
                    <option>NA-West</option>
                    <option>NA-Central</option>
                    <option>Europe</option>
                    <option>Oceania</option>
                    <option>Asia</option>
                    <option>Brazil</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-neutral-400">Platform</label>
                  <select 
                     value={platform}
                     onChange={(e) => setPlatform(e.target.value)}
                     className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-white appearance-none"
                  >
                    <option>PC</option>
                    <option>PlayStation</option>
                    <option>Xbox</option>
                    <option>Switch</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Search className="w-5 h-5 animate-spin" />
                    SYNCING...
                  </>
                ) : (
                  <>
                    ENTER HUB
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="pt-4 border-t border-neutral-800">
                <button 
                    type="button" 
                    onClick={() => setStep('manual')}
                    className="text-sm text-neutral-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2 w-full"
                >
                    <Edit2 className="w-3 h-3" />
                    Enter Stats Manually
                </button>
              </div>
            </form>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white brand-font">PLAYER FOUND</h3>
                    <p className="text-sm text-neutral-400">Confirm your stats to proceed.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <div className="text-xs text-neutral-500 uppercase">Rank</div>
                        <div className="font-bold text-white">{stats.rank}</div>
                    </div>
                     <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <div className="text-xs text-neutral-500 uppercase">PR</div>
                        <div className="font-bold text-white">{stats.pr}</div>
                    </div>
                     <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <div className="text-xs text-neutral-500 uppercase">K/D</div>
                        <div className="font-bold text-white">{stats.kd}</div>
                    </div>
                     <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <div className="text-xs text-neutral-500 uppercase">Earnings</div>
                        <div className="font-bold text-white">{stats.earnings}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setStep('manual')} 
                        className="flex-1 py-3 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={handleManualSubmit}
                        className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors uppercase"
                    >
                        CONFIRM
                    </button>
                </div>
            </div>
          )}

          {step === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white brand-font">MANUAL ENTRY</h3>
                    <p className="text-sm text-neutral-400">
                        {error ? <span className="text-red-500 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3"/> {error}</span> : "Input your stats manually."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-medium text-neutral-500">Rank</label>
                        <select 
                            value={stats.rank}
                            onChange={(e) => updateStat('rank', e.target.value)}
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                        >
                            <option>Unranked</option>
                            <option>Bronze</option>
                            <option>Silver</option>
                            <option>Gold</option>
                            <option>Platinum</option>
                            <option>Diamond</option>
                            <option>Elite</option>
                            <option>Champion</option>
                            <option>Unreal</option>
                        </select>
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-medium text-neutral-500">PR</label>
                        <input 
                            type="number" 
                            value={stats.pr}
                            onChange={(e) => updateStat('pr', Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                        />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-medium text-neutral-500">K/D</label>
                        <input 
                            type="text" 
                            value={stats.kd}
                            onChange={(e) => updateStat('kd', e.target.value)}
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                        />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="text-xs font-medium text-neutral-500">Win Rate</label>
                        <input 
                            type="text" 
                            value={stats.winRate}
                            onChange={(e) => updateStat('winRate', e.target.value)}
                            placeholder="5.2%"
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                        />
                    </div>
                     <div className="space-y-1 text-left col-span-2">
                        <label className="text-xs font-medium text-neutral-500">Earnings</label>
                        <input 
                            type="text" 
                            value={stats.earnings}
                            onChange={(e) => updateStat('earnings', e.target.value)}
                            placeholder="$0"
                            className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors uppercase tracking-wider"
                >
                    INITIALIZE HUB
                </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;