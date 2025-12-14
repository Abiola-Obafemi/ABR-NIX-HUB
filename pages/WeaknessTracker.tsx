import React, { useState } from 'react';
import { Target, Check, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Weakness } from '../types';

const WeaknessTracker: React.FC = () => {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([
    { id: '1', category: 'Aim', description: 'Shotgun tracking in close range box fights', status: 'Identified', priority: 'High' },
    { id: '2', category: 'Game Sense', description: 'Over-peeking on height during endgame', status: 'Improving', priority: 'Medium' },
  ]);
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<Weakness['category']>('Mechanics');

  const addWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc) return;
    const newItem: Weakness = {
      id: Date.now().toString(),
      category: newCat,
      description: newDesc,
      status: 'Identified',
      priority: 'Medium'
    };
    setWeaknesses([...weaknesses, newItem]);
    setNewDesc('');
  };

  const deleteWeakness = (id: string) => {
    setWeaknesses(weaknesses.filter(w => w.id !== id));
  };

  const toggleStatus = (id: string) => {
    setWeaknesses(weaknesses.map(w => {
        if(w.id === id) {
            return { ...w, status: w.status === 'Identified' ? 'Improving' : w.status === 'Improving' ? 'Resolved' : 'Identified' }
        }
        return w;
    }))
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-neutral-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 brand-font">WEAKNESS TRACKER</h1>
          <p className="text-neutral-400">Identify patterns in your deaths and track your improvement.</p>
        </div>
        
        {/* Simple Add Form */}
        <form onSubmit={addWeakness} className="flex gap-2 w-full md:w-auto">
            <select 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            >
                <option value="Mechanics">Mechanics</option>
                <option value="Aim">Aim</option>
                <option value="Game Sense">Game Sense</option>
                <option value="Mental">Mental</option>
            </select>
            <input 
                type="text" 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What killed you?"
                className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-red-600 placeholder:text-neutral-600"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg">
                <Plus className="w-5 h-5" />
            </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {weaknesses.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
                <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No weaknesses recorded. You're either a god or you're not tracking!</p>
            </div>
        )}

        {weaknesses.map((item) => (
          <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-red-600/30 transition-all group">
            <div className="flex items-center gap-4 w-full">
              <div onClick={() => toggleStatus(item.id)} className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                item.status === 'Resolved' ? 'bg-red-600 border-red-600' : 'border-neutral-600 hover:border-red-500'
              }`}>
                {item.status === 'Resolved' && <Check className="w-4 h-4 text-white" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(item.priority)} font-bold`}>
                        {item.priority}
                    </span>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">
                        {item.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        item.status === 'Improving' ? 'bg-blue-900/30 text-blue-400' : 
                        item.status === 'Resolved' ? 'bg-red-900/30 text-red-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                        {item.status.toUpperCase()}
                    </span>
                </div>
                <h3 className={`font-bold text-lg ${item.status === 'Resolved' ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                    {item.description}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteWeakness(item.id)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex items-start gap-3 text-sm text-neutral-400">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p>Pro Tip: Coach ABØ reads this list to customize your warmups. Keep it updated.</p>
      </div>
    </div>
  );
};

export default WeaknessTracker;