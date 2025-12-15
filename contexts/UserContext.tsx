import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AppData, Weakness, JournalEntry, GamePlan, Routine } from '../types';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { fetchPlayerStats, getLiveMetaUpdates } from '../services/geminiService';

interface UserContextType {
  data: AppData;
  loading: boolean;
  currentUser: User | null; // Firebase User
  
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
  // Manual Sync (Legacy)
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

// Helper: Recursively convert undefined to null for Firestore compatibility
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      result[key] = val === undefined ? null : sanitizeForFirestore(val);
    }
  }
  return result;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Handle Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If logged in, listen to Firestore
        const userDocRef = doc(db, "users", user.uid);
        
        // Real-time listener for Cloud Sync
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
             // Merge cloud data with local structure ensuring no nulls
             const cloudData = docSnap.data() as AppData;
             setData({
                 user: cloudData.user || null,
                 weaknesses: cloudData.weaknesses || [],
                 journal: cloudData.journal || [],
                 gamePlans: cloudData.gamePlans || [],
                 lastRoutine: cloudData.lastRoutine || undefined
             });
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        // If not logged in, try LocalStorage (Offline Mode)
        const stored = localStorage.getItem('abronix_data');
        if (stored) {
            try {
                setData(JSON.parse(stored));
            } catch(e) { console.error(e); }
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Persist Data (Firestore if Online, LocalStorage if Offline)
  useEffect(() => {
    if (loading) return;

    // Save to LocalStorage always as backup
    localStorage.setItem('abronix_data', JSON.stringify(data));

    // Save to Firestore if Logged In
    if (currentUser) {
        const saveToCloud = async () => {
            try {
                // Sanitize data to remove undefined values before saving
                const safeData = sanitizeForFirestore(data);
                await setDoc(doc(db, "users", currentUser.uid), safeData, { merge: true });
            } catch (e) {
                console.error("Cloud Save Error:", e);
            }
        };
        // Debounce could be added here, but for now simple save
        saveToCloud();
    }
  }, [data, currentUser, loading]);

  // 3. Auto-Refresh Stats (Every 5 Minutes)
  useEffect(() => {
      if (!data.user?.username) return;

      const refreshStats = async () => {
          console.log("Auto-refreshing stats...");
          const newStats = await fetchPlayerStats(data.user!.username);
          if (newStats && newStats.rank !== "Unavailable") {
              setData(prev => ({
                  ...prev,
                  user: { ...prev.user!, stats: newStats }
              }));
          }
      };

      // Initial Refresh on load
      // refreshStats(); 

      const interval = setInterval(refreshStats, 5 * 60 * 1000); // 5 Minutes
      return () => clearInterval(interval);
  }, [data.user?.username]);


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

  const exportData = () => {
    try {
      const json = JSON.stringify(data);
      return btoa(json);
    } catch (e) { return ""; }
  };

  const importData = (encodedString: string) => {
    try {
      const json = atob(encodedString);
      const parsed = JSON.parse(json);
      setData(parsed);
      return true;
    } catch (e) { return false; }
  };

  return (
    <UserContext.Provider value={{ 
      data, 
      loading, 
      currentUser,
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
  return {
    ...context,
    user: context.data.user,
    setUser: context.updateUser
  };
};