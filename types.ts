export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Weakness {
  id: string;
  category: 'Mechanics' | 'Game Sense' | 'Aim' | 'Mental';
  description: string;
  status: 'Identified' | 'Improving' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
}

export interface JournalEntry {
  id: string;
  date: string;
  tournamentName: string;
  placement: number;
  points: number;
  eliminations: number;
  notes: string;
  keyMistake: string;
}

export interface RoutineItem {
  activity: string;
  durationMin: number;
  mapCode?: string; // Added for creative codes
  notes: string;
}

export interface DailyRoutine {
  day: string;
  focus: string;
  activities: RoutineItem[];
}

export interface Routine {
  generatedAt: string;
  focusArea: string;
  weeklySchedule: DailyRoutine[];
}

export interface UserProfile {
  username: string;
  region: string;
  platform: string;
  stats?: PlayerStats; // Real stats
}

export interface PlayerStats {
  rank: string; // e.g., "Unreal", "Elite"
  pr: number;   // Power Ranking
  earnings: string; // e.g., "$500"
  winRate: string;
  kd: string; // Kill/Death Ratio
  matches: string; // Total matches played
  analysis?: string; // AI generated advice based on these stats
}

export interface MetaUpdate {
  seasonName: string;
  topWeapons: string[];
  mobilityMeta: string;
  mapChanges: string;
}

// Fortnite API Types
export interface GameNews {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
}

export interface GameMap {
  images: {
    blank: string;
    pois: string;
  };
}

// Game Plan / Map Editor Types
export interface MapMarker {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'drop' | 'rotate' | 'enemy' | 'loot';
  label?: string;
}

export interface MapLine {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  type: 'solid' | 'dashed';
}

export interface GamePlan {
  id: string;
  name: string;
  markers: MapMarker[];
  lines: MapLine[];
  notes: string;
  createdAt: number;
}

// Global App State for Persistence/Sync
export interface AppData {
  user: UserProfile | null;
  weaknesses: Weakness[];
  journal: JournalEntry[];
  gamePlans: GamePlan[];
  lastRoutine?: Routine;
}