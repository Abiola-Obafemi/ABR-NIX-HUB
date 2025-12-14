import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Plus, Trophy, Crosshair, Skull, TrendingUp } from 'lucide-react';
import { JournalEntry } from '../types';
import { useUser } from '../contexts/UserContext';

const TournamentJournal: React.FC = () => {
  const { data, addJournalEntry } = useUser();
  const entries = data.journal;
  
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    tournamentName: '',
    placement: 0,
    points: 0,
    eliminations: 0,
    notes: '',
    keyMistake: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        tournamentName: formData.tournamentName!,
        placement: Number(formData.placement),
        points: Number(formData.points),
        eliminations: Number(formData.eliminations),
        notes: formData.notes || '',
        keyMistake: formData.keyMistake || ''
    };
    addJournalEntry(newEntry);
    setShowForm(false);
    setFormData({ tournamentName: '', placement: 0, points: 0, eliminations: 0, notes: '', keyMistake: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 brand-font">JOURNAL</h1> 
           <p className="text-neutral-400">Track your progress and analyze your tournament performance.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold uppercase"
        >
          <Plus className="w-5 h-5" />
          Log Tournament
        </button>
      </div>

      {/* Stats Chart */}
      {entries.length > 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-80 relative">
          <h3 className="text-neutral-500 text-sm font-bold uppercase tracking-wider mb-4 absolute top-6 left-6">Points Progression</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#dc2626' }}
              />
              <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', r: 4 }}
                  activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-12 h-12 text-neutral-700 mb-4" />
            <h3 className="text-white font-bold text-lg">No Stats Recorded</h3>
            <p className="text-neutral-500 max-w-sm mt-2">
                Log your first tournament entry to visualize your points progression over time.
            </p>
        </div>
      )}

      {/* Add Entry Form Modal/Inline */}
      {showForm && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 uppercase">New Entry</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Tournament Name" className="bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" value={formData.tournamentName} onChange={e => setFormData({...formData, tournamentName: e.target.value})} />
                <input required type="number" placeholder="Placement" className="bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" value={formData.placement || ''} onChange={e => setFormData({...formData, placement: Number(e.target.value)})} />
                <input required type="number" placeholder="Points" className="bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" value={formData.points || ''} onChange={e => setFormData({...formData, points: Number(e.target.value)})} />
                <input required type="number" placeholder="Eliminations" className="bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" value={formData.eliminations || ''} onChange={e => setFormData({...formData, eliminations: Number(e.target.value)})} />
                <textarea placeholder="Key Mistake" className="md:col-span-2 bg-black border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" value={formData.keyMistake} onChange={e => setFormData({...formData, keyMistake: e.target.value})} />
                <textarea placeholder="General Notes" className="md:col-span-2 bg-black border border-neutral-800 rounded-lg p-3 text-white h-24 focus:border-red-600 outline-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                <div className="md:col-span-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 font-bold uppercase">Save Entry</button>
                </div>
            </form>
        </div>
      )}

      {/* Entries List */}
      <div className="grid grid-cols-1 gap-4">
        {entries.length === 0 && !showForm && (
            <div className="text-center py-8 text-neutral-600">
                Start by logging your recent tournaments above.
            </div>
        )}
        {entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 hover:border-red-900 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase">{entry.tournamentName}</h3>
                        <p className="text-sm text-neutral-500">{entry.date}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800 px-3 py-1 rounded">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold">#{entry.placement}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800 px-3 py-1 rounded">
                            <Crosshair className="w-4 h-4 text-blue-400" />
                            <span className="font-bold">{entry.points} pts</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800 px-3 py-1 rounded">
                            <Skull className="w-4 h-4 text-red-500" />
                            <span className="font-bold">{entry.eliminations} kills</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <span className="text-xs text-red-500 uppercase tracking-wider font-bold block mb-1">Mistake to fix</span>
                        <p className="text-neutral-300">{entry.keyMistake}</p>
                    </div>
                     <div className="bg-black p-3 rounded-lg border border-neutral-800">
                        <span className="text-xs text-neutral-500 uppercase tracking-wider font-bold block mb-1">Notes</span>
                        <p className="text-neutral-300 text-sm">{entry.notes}</p>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentJournal;