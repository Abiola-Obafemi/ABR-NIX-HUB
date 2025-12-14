import React, { useEffect, useState } from 'react';
import { Trophy, Target, TrendingUp, Activity, Zap, MessageSquare, Globe, Loader2, Map as MapIcon, Newspaper, Crosshair, Swords, Edit2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getLiveMetaUpdates } from '../services/geminiService';
import { getGameNews, getMapData } from '../services/fortniteApiService';
import { MetaUpdate, GameNews, GameMap, PlayerStats } from '../types';

const Dashboard: React.FC = () => {
  const { user, setUser } = useUser();
  const [meta, setMeta] = useState<MetaUpdate | null>(null);
  const [news, setNews] = useState<GameNews[]>([]);
  const [mapData, setMapData] = useState<GameMap | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editStats, setEditStats] = useState<PlayerStats | undefined>(user?.stats);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [metaData, newsData, mapRes] = await Promise.all([
        getLiveMetaUpdates(),
        getGameNews(),
        getMapData()
      ]);
      setMeta(metaData);
      setNews(newsData);
      setMapData(mapRes);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveStats = () => {
    if (user && editStats) {
        setUser({
            ...user,
            stats: editStats
        });
        setIsEditing(false);
    }
  };

  const updateEditStat = (field: keyof PlayerStats, value: any) => {
    if (editStats) {
        setEditStats({ ...editStats, [field]: value });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 brand-font">
            WELCOME BACK, <span className="text-red-600">{user?.username?.toUpperCase() || 'PLAYER'}</span>
          </h1>
          <p className="text-neutral-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user?.stats?.pr ? 'bg-red-500' : 'bg-neutral-600'}`}></span>
            {user?.stats?.rank !== "Unknown" ? `RANK: ${user?.stats?.rank.toUpperCase()}` : "PROFILE CONNECTED"} 
            <span className="text-neutral-600">•</span>
            {user?.region}
          </p>
        </div>
        <div className="flex gap-3">
             {isEditing ? (
                 <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSaveStats} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-2 font-bold">
                        <Check className="w-4 h-4" /> SAVE
                    </button>
                 </>
             ) : (
                <button onClick={() => { setEditStats(user?.stats); setIsEditing(true); }} className="px-4 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-red-600/50 transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> EDIT STATS
                </button>
             )}
            <Link 
            to="/routine"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 uppercase tracking-wide"
            >
            <Activity className="w-5 h-5" />
            NEW ROUTINE
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Earnings/PR */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-24 h-24 text-red-500" />
          </div>
          <h3 className="text-neutral-500 font-bold uppercase text-xs mb-1 tracking-wider">Earnings & PR</h3>
          {isEditing ? (
             <div className="space-y-2">
                <input type="text" value={editStats?.earnings} onChange={e => updateEditStat('earnings', e.target.value)} className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-sm" placeholder="$0" />
                <input type="number" value={editStats?.pr} onChange={e => updateEditStat('pr', Number(e.target.value))} className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-sm" placeholder="PR" />
             </div>
          ) : (
            <>
                <p className="text-2xl font-bold text-white mb-1">
                    {user?.stats?.earnings || '$0'}
                </p>
                <div className="flex gap-2 text-sm text-neutral-400">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span>{user?.stats?.pr ? `${user.stats.pr.toLocaleString()} PR` : '0 PR'}</span>
                </div>
            </>
          )}
        </div>

        {/* K/D Ratio */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crosshair className="w-24 h-24 text-red-500" />
          </div>
          <h3 className="text-neutral-500 font-bold uppercase text-xs mb-1 tracking-wider">K/D Ratio</h3>
          {isEditing ? (
             <div className="space-y-2">
                <input type="text" value={editStats?.kd} onChange={e => updateEditStat('kd', e.target.value)} className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-sm" placeholder="K/D" />
                <input type="text" value={editStats?.winRate} onChange={e => updateEditStat('winRate', e.target.value)} className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-sm" placeholder="Win %" />
             </div>
          ) : (
            <>
                <p className="text-3xl font-bold text-white mb-4">{user?.stats?.kd || '0.0'}</p>
                <div className="flex gap-2 text-sm text-neutral-400">
                    <span>Win Rate: <span className="text-white">{user?.stats?.winRate || 'N/A'}</span></span>
                </div>
            </>
          )}
        </div>

        {/* Matches */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Swords className="w-24 h-24 text-red-500" />
          </div>
          <h3 className="text-neutral-500 font-bold uppercase text-xs mb-1 tracking-wider">Total Matches</h3>
          {isEditing ? (
             <input type="text" value={editStats?.matches} onChange={e => updateEditStat('matches', e.target.value)} className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-sm mt-2" placeholder="Matches" />
          ) : (
            <>
                <p className="text-3xl font-bold text-white mb-4">{user?.stats?.matches || '0'}</p>
                <div className="flex gap-2 text-sm text-neutral-400">
                    <span>Recorded Data</span>
                </div>
            </>
          )}
        </div>

        {/* Live Season */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe className="w-24 h-24 text-red-500" />
          </div>
          <h3 className="text-neutral-500 font-bold uppercase text-xs mb-1 tracking-wider">Live Season</h3>
          {loading ? (
             <div className="h-9 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                <span className="text-red-400 text-sm">Syncing...</span>
             </div>
          ) : (
             <p className="text-xl font-bold text-white mb-4 line-clamp-2">{meta?.seasonName || "Chapter 6 Season 1"}</p>
          )}
          <a href="https://www.fortnite.com/news" target="_blank" rel="noreferrer" className="text-sm text-red-500 hover:text-red-400 uppercase font-bold tracking-wide">Patch Notes &rarr;</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Analysis & Meta) */}
        <div className="lg:col-span-7 space-y-8">
            
            {/* AI Performance Analysis */}
            <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full pointer-events-none group-hover:bg-red-600/20 transition-all"></div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2 relative z-10 brand-font">
                    <Zap className="w-5 h-5 text-red-600 fill-current" /> ABRØNIX ANALYSIS
                </h2>
                <p className="text-neutral-300 text-lg leading-relaxed relative z-10 border-l-2 border-red-600 pl-4">
                    {user?.stats?.analysis || "Play more matches to unlock detailed insights based on your playstyle."}
                </p>
                {user?.stats?.kd && user.stats.kd !== "0.0" && (
                     <div className="mt-4 flex gap-2 relative z-10">
                        <span className="text-xs font-bold bg-neutral-800 text-neutral-300 px-3 py-1 rounded border border-neutral-700">
                            Based on {user.stats.kd} KD
                        </span>
                        <span className="text-xs font-bold bg-neutral-800 text-neutral-300 px-3 py-1 rounded border border-neutral-700">
                            Based on {user.stats.winRate} WR
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 brand-font">
                <Target className="w-5 h-5 text-red-600" /> QUICK ACTIONS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/coach" className="p-4 bg-black rounded-lg border border-neutral-800 hover:border-red-600/50 transition-all flex flex-col gap-2 group">
                  <MessageSquare className="w-6 h-6 text-neutral-400 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                  <span className="font-bold text-neutral-200 group-hover:text-white">COACH ABØ</span>
                </Link>
                <Link to="/journal" className="p-4 bg-black rounded-lg border border-neutral-800 hover:border-red-600/50 transition-all flex flex-col gap-2 group">
                  <Trophy className="w-6 h-6 text-neutral-400 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                  <span className="font-bold text-neutral-200 group-hover:text-white">LOG TOURNAMENT</span>
                </Link>
              </div>
            </div>

            {/* Live Meta Update */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative">
              <h2 className="text-xl font-bold text-white mb-6 brand-font">LIVE META INTEL</h2>
              
              {loading ? (
                 <div className="space-y-4 opacity-50 animate-pulse">
                    <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
                    <div className="h-4 bg-neutral-800 rounded w-full"></div>
                 </div>
              ) : (
                 <div className="space-y-4">
                   <div className="flex gap-4 items-start pb-4 border-b border-neutral-800">
                     <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                     <div>
                       <h4 className="font-bold text-neutral-200 uppercase text-sm">Meta Weapons</h4>
                       <p className="text-sm text-neutral-400 mt-1">
                         {meta?.topWeapons.join(', ') || "Analyzing weapon pool..."}
                       </p>
                     </div>
                   </div>
                   <div className="flex gap-4 items-start pb-4 border-b border-neutral-800">
                     <div className="w-2 h-2 rounded-full bg-red-800 mt-2 flex-shrink-0"></div>
                     <div>
                       <h4 className="font-bold text-neutral-200 uppercase text-sm">Mobility</h4>
                       <p className="text-sm text-neutral-400 mt-1">{meta?.mobilityMeta || "Analyzing rotation items..."}</p>
                     </div>
                   </div>
                   <div className="flex gap-4 items-start">
                     <div className="w-2 h-2 rounded-full bg-neutral-600 mt-2 flex-shrink-0"></div>
                     <div>
                       <h4 className="font-bold text-neutral-200 uppercase text-sm">Map Intel</h4>
                       <p className="text-sm text-neutral-400 mt-1">{meta?.mapChanges || "Analyzing POIs..."}</p>
                     </div>
                   </div>
                 </div>
              )}
            </div>
        </div>

        {/* Right Column (Map & News) */}
        <div className="lg:col-span-5 space-y-8">
            {/* Current Map */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 brand-font">
                    <MapIcon className="w-5 h-5 text-red-600" /> CURRENT MAP
                </h2>
                {mapData ? (
                    <div className="rounded-lg overflow-hidden border border-neutral-800 aspect-square relative group">
                        <img src={mapData.images.pois} alt="Fortnite Map" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4">
                            <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded backdrop-blur-sm animate-pulse">LIVE FEED</span>
                        </div>
                    </div>
                ) : (
                    <div className="aspect-square bg-black rounded-lg flex items-center justify-center text-neutral-600">
                        {loading ? <Loader2 className="animate-spin text-red-600" /> : "Map Unavailable"}
                    </div>
                )}
            </div>

            {/* News Feed */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 brand-font">
                    <Newspaper className="w-5 h-5 text-red-600" /> INTEL FEED
                </h2>
                <div className="space-y-4">
                    {news.length > 0 ? news.map(item => (
                        <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="flex gap-3 items-start group hover:bg-neutral-800 p-2 rounded-lg transition-colors">
                            <img src={item.image} alt="" className="w-16 h-16 object-cover rounded bg-neutral-950" />
                            <div>
                                <h4 className="font-bold text-neutral-200 text-sm group-hover:text-red-500 transition-colors line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{item.body}</p>
                            </div>
                        </a>
                    )) : (
                        <div className="text-center py-4 text-neutral-500 text-sm">No news loaded.</div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;