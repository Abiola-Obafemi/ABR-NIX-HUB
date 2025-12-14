import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AppData, Weakness, JournalEntry, GamePlan, Routine } from '../types';

interface UserContextType {
  data: AppData;
  loading: boolean;
  // User Actions
  updateUser: (u: UserProfile | null) => void;
  // Weakness Actions
  addWeakness: (w: Weakness) => void;
  deleteWeakness: (id: string) => void;
  updateWeakness: (w: Weakness) => void;
  // Journal Actions
  addJournalEntry: (e: JournalEntry) => void;
  // Game Plan Actions
  saveGamePlan: (gp: GamePlan) => void;
  deleteGamePlan: (id: string) => void;
  // Routine Actions
  saveRoutine: (r: Routine) => void;
  // Sync Actions
  exportData: () => string;
  importData: (jsonString: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const INITIAL_DATA: AppData = {
  user: null,
  weaknesses: [],
  journal: [],
  gamePlans: []
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abronix_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migration: Check if it's the old format (just user profile)
        if (parsed.username && !parsed.user) {
           setData({ ...INITIAL_DATA, user: parsed });
        } else {
           setData({ ...INITIAL_DATA, ...parsed });
        }
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    setLoading(false);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('abronix_data', JSON.stringify(data));
      // Keep legacy key for compatibility if needed, or remove it
      if (data.user) {
          localStorage.setItem('snapin_user', JSON.stringify(data.user));
      }
    }
  }, [data, loading]);

  // --- Actions ---

  const updateUser = (u: UserProfile | null) => {
    setData(prev => ({ ...prev, user: u }));
  };

  const addWeakness = (w: Weakness) => {
    setData(prev => ({ ...prev, weaknesses: [...prev.weaknesses, w] }));
  };

  const deleteWeakness = (id: string) => {
    setData(prev => ({ ...prev, weaknesses: prev.weaknesses.filter(w => w.id !== id) }));
  };

  const updateWeakness = (updated: Weakness) => {
    setData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.map(w => w.id === updated.id ? updated : w)
    }));
  };

  const addJournalEntry = (e: JournalEntry) => {
    setData(prev => ({ ...prev, journal: [...prev.journal, e] }));
  };

  const saveGamePlan = (gp: GamePlan) => {
    setData(prev => {
        const existingIndex = prev.gamePlans.findIndex(p => p.id === gp.id);
        if (existingIndex >= 0) {
            const newPlans = [...prev.gamePlans];
            newPlans[existingIndex] = gp;
            return { ...prev, gamePlans: newPlans };
        }
        return { ...prev, gamePlans: [...prev.gamePlans, gp] };
    });
  };

  const deleteGamePlan = (id: string) => {
      setData(prev => ({ ...prev, gamePlans: prev.gamePlans.filter(p => p.id !== id) }));
  }

  const saveRoutine = (r: Routine) => {
    setData(prev => ({ ...prev, lastRoutine: r }));
  };

  // --- Sync Functions ---

  const exportData = () => {
    try {
      const json = JSON.stringify(data);
      return btoa(json); // Base64 encode for easy copying
    } catch (e) {
      console.error("Export failed", e);
      return "";
    }
  };

  const importData = (encodedString: string) => {
    try {
      const json = atob(encodedString);
      const parsed = JSON.parse(json);
      // Basic validation
      if (!parsed.weaknesses || !parsed.journal) {
        throw new Error("Invalid data format");
      }
      setData(parsed);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ 
      data, 
      loading, 
      updateUser,
      addWeakness,
      deleteWeakness,
      updateWeakness,
      addJournalEntry,
      saveGamePlan,
      deleteGamePlan,
      saveRoutine,
      exportData,
      importData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  // Adapter to maintain compatibility with existing pages expecting 'user' directly
  return {
    ...context,
    user: context.data.user,
    setUser: context.updateUser // Alias for compatibility
  };
};