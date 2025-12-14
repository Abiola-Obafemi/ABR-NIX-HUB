import { GameNews, GameMap, PlayerStats } from "../types";

const BASE_URL = 'https://fortnite-api.com/v2';
const IO_BASE_URL = 'https://fortniteapi.io/v1';

// Helper to safely get Env Var in Browser (Vite) or Node environments
const getEnvVar = (viteKey: string, nodeKey: string) => {
    let val = '';
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env[viteKey]) {
            // @ts-ignore
            return import.meta.env[viteKey];
        }
    } catch(e) {}
    
    try {
        if (typeof process !== 'undefined' && process.env && process.env[nodeKey]) {
            return process.env[nodeKey];
        }
    } catch(e) {}
    
    return '';
}

// Get the key safely
const API_KEY = getEnvVar('VITE_FORTNITE_API_KEY', 'VITE_FORTNITE_API_KEY') || 'YOUR_FORTNITEAPI_IO_KEY_HERE';

const FALLBACK_MAP_URL = "https://media.fortniteapi.io/images/map.png";

export const getRealStats = async (username: string): Promise<PlayerStats | null> => {
  if (API_KEY === 'YOUR_FORTNITEAPI_IO_KEY_HERE' || !API_KEY) {
      console.warn("Please add a FortniteAPI.io Key in services/fortniteApiService.ts or Environment Variables");
      return null;
  }

  try {
    // Step 1: Get Account ID
    const lookupRes = await fetch(`${IO_BASE_URL}/lookup?username=${username}`, {
        headers: { 'Authorization': API_KEY }
    });
    
    if (!lookupRes.ok) return null;
    const lookupData = await lookupRes.json();
    
    if (!lookupData.result || !lookupData.account_id) return null;
    
    const accountId = lookupData.account_id;

    // Step 2: Get Stats
    const statsRes = await fetch(`${IO_BASE_URL}/stats?account=${accountId}`, {
        headers: { 'Authorization': API_KEY }
    });

    if (!statsRes.ok) return null;
    const statsData = await statsRes.json();

    if (statsData.result && statsData.global_stats) {
        const g = statsData.global_stats;
        // Calculate totals across platforms/modes if needed, or take global
        // Note: FortniteAPI.io structure varies, simplified here for Global Solo/Duo/Squad combined
        
        const solo = g.solo || {};
        const duo = g.duo || {};
        const squad = g.squad || {};
        
        const totalMatches = (solo.matchesplayed || 0) + (duo.matchesplayed || 0) + (squad.matchesplayed || 0);
        const totalWins = (solo.placetop1 || 0) + (duo.placetop1 || 0) + (squad.placetop1 || 0);
        const totalKills = (solo.kills || 0) + (duo.kills || 0) + (squad.kills || 0);
        
        const kd = (totalKills / (totalMatches - totalWins)).toFixed(2);
        const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) + '%' : '0%';

        return {
            rank: "N/A (API Limit)", // Rank requires a different endpoint usually not free or complex
            pr: 0, // PR is usually tracker network exclusive
            earnings: "$0", // Earnings are private/tracker exclusive
            winRate: winRate,
            kd: kd,
            matches: totalMatches.toString(),
            analysis: "Stats retrieved from FortniteAPI.io"
        };
    }
    
    return null;

  } catch (e) {
      console.error("Real Stats Fetch Error", e);
      return null;
  }
}

export const getGameNews = async (): Promise<GameNews[]> => {
  try {
    const response = await fetch(`${BASE_URL}/news/br`);
    
    if (!response.ok) return [];
    
    const text = await response.text();
    if (!text) return [];

    try {
        const data = JSON.parse(text);
        if (data.status === 200 && data.data?.motds) {
          return data.data.motds.map((item: any) => ({
            id: item.id,
            title: item.title,
            body: item.body,
            image: item.image,
            url: item.website || '#'
          })).slice(0, 3);
        }
    } catch (e) {
        console.warn("Failed to parse News JSON", e);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch Fortnite news", error);
    return [];
  }
};

export const getMapData = async (): Promise<GameMap | null> => {
  try {
    const response = await fetch(`${BASE_URL}/map`);
    
    if (!response.ok) {
        throw new Error(`Map API returned ${response.status}`);
    }

    const text = await response.text();
    if (!text) throw new Error("Empty response from Map API");

    const data = JSON.parse(text);
    if (data.status === 200 && data.data) {
      return {
        images: {
          blank: data.data.images.blank,
          pois: data.data.images.pois
        }
      };
    }
    return null;
  } catch (error) {
    // Return a constructed object with the fallback URL
    return {
        images: {
            blank: FALLBACK_MAP_URL,
            pois: FALLBACK_MAP_URL
        }
    };
  }
};