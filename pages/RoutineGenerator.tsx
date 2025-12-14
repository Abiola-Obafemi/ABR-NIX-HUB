import React, { useState } from 'react';
import { Zap, Clock, Target, CheckCircle2, List, RotateCcw, CalendarDays, Gamepad2, Search } from 'lucide-react';
import { generateRoutine } from '../services/geminiService';
import { Routine } from '../types';

const RoutineGenerator: React.FC = () => {
  const [hours, setHours] = useState(2);
  const [goal, setGoal] = useState('Reach Unreal Rank');
  const [weaknesses, setWeaknesses] = useState<string>('');
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const weaknessArray = weaknesses.split(',').map(w => w.trim());
    const result = await generateRoutine(hours, weaknessArray, goal);
    setRoutine(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white brand-font">ROUTINE ARCHITECT</h1>
        <p className="text-neutral-500">Generates a 7-day plan with <span className="text-red-500 font-bold">actual Creative Map Codes</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wide">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Daily Playtime (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wide">
                  <Target className="w-4 h-4 inline mr-2" />
                  Primary Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none"
                >
                  <option>Reach Unreal Rank</option>
                  <option>Place in Cash Cup</option>
                  <option>Qualify for FNCS</option>
                  <option>Master Piece Control</option>
                  <option>Improve Aim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-400 mb-2 uppercase tracking-wide">
                  <List className="w-4 h-4 inline mr-2" />
                  Weaknesses
                </label>
                <textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="e.g. Off-spawn fights, close range edits, endgame rotation..."
                  className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white h-24 focus:ring-1 focus:ring-red-600 focus:border-red-600 resize-none outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 animate-spin" />
                    SEARCHING...
                  </span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    BUILD PLAN
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          {routine ? (
            <div className="space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 brand-font">7-DAY PROTOCOL</h2>
                        <p className="text-red-500 text-sm font-bold uppercase tracking-wider">Focus: {routine.focusArea}</p>
                    </div>
                    <button onClick={() => setRoutine(null)} className="text-neutral-500 hover:text-white transition-colors">
                        <RotateCcw className="w-5 h-5"/>
                    </button>
                 </div>
                
                <div className="space-y-8">
                  {routine.weeklySchedule.map((dayPlan, index) => (
                    <div key={index} className="border-b border-neutral-800 pb-6 last:border-0">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 uppercase">
                         <CalendarDays className="w-5 h-5 text-red-600" />
                         {dayPlan.day}
                         <span className="text-xs font-bold text-neutral-400 ml-2 bg-neutral-800 px-2 py-1 rounded">{dayPlan.focus}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayPlan.activities.map((act, i) => (
                             <div key={i} className="bg-black/50 rounded-lg p-4 border border-neutral-800 hover:border-red-600/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-neutral-200">{act.activity}</span>
                                    <span className="text-xs font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded">{act.durationMin}m</span>
                                </div>
                                <p className="text-sm text-neutral-400 mb-3">{act.notes}</p>
                                {act.mapCode && (
                                    <div className="flex items-center gap-2 bg-red-900/10 p-2 rounded border border-red-900/20">
                                        <Gamepad2 className="w-4 h-4 text-red-500" />
                                        <code className="text-sm text-red-400 font-mono select-all">{act.mapCode}</code>
                                    </div>
                                )}
                             </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center gap-2 text-sm text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <span>Map codes verified via Google Search for current season.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 border-dashed rounded-xl p-12 text-center text-neutral-500">
              <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-300 mb-2 uppercase">Awaiting Protocol</h3>
              <p className="max-w-md">ABØ's AI will find the best maps for your specific weaknesses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineGenerator;