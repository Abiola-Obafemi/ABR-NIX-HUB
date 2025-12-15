import { GoogleGenAI, Type } from "@google/genai";
import { Routine, MetaUpdate, PlayerStats } from "../types";

// Helper to safely get API Key
const getApiKey = () => {
  let key = '';
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        key = process.env.API_KEY;
      }
    } catch (e) {}
  }
  
  if (!key) {
      console.warn("MISSING GEMINI API KEY. AI Features will fail. Check .env file.");
  }
  return key;
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const modelFlash = 'gemini-2.5-flash';

// Helper to clean markdown code blocks from JSON strings
const cleanAndParseJson = <T>(text: string): T | null => {
  try {
    if (!text) return null;
    
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        const potentialJson = text.substring(firstOpen, lastClose + 1);
        try {
            return JSON.parse(potentialJson);
        } catch (e) {}
    }

    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '');
    }
    
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

/**
 * Generates specific advice based on the user's fetched stats.
 */
export const generatePerformanceAnalysis = async (stats: PlayerStats, username: string): Promise<string> => {
    try {
        const prompt = `Analyze these Fortnite stats for player ${username}:
        - Rank: ${stats.rank}
        - PR: ${stats.pr}
        - K/D: ${stats.kd}
        - Win Rate: ${stats.winRate}
        
        Provide a 1-sentence, high-impact piece of advice for improvement.`;

        const response = await ai.models.generateContent({
            model: modelFlash,
            contents: prompt,
        });
        
        return response.text || "Play more ranked matches to generate actionable data.";
    } catch (e) {
        console.error("Analysis Error:", e);
        return "Focus on mechanics and game sense to improve across the board.";
    }
}

/**
 * Searches for a player's real stats using Google Search Grounding.
 */
export const fetchPlayerStats = async (username: string): Promise<PlayerStats> => {
  try {
    // Adding a timestamp to the prompt prevents caching logic sometimes
    const timestamp = new Date().toISOString();
    const prompt = `
    [Context: ${timestamp}]
    Search for LATEST public Fortnite stats for "${username}".
    
    1.  **Search Query**: "Fortnite Tracker ${username} current stats".
    2.  **Extract**:
        *   PR (Power Ranking)
        *   Rank (e.g. Unreal, Elite, Champion)
        *   Earnings
        *   K/D Ratio
        *   Win Rate
        *   Matches Played

    RETURN ONLY RAW JSON. No Markdown.
    {
      "rank": "string (default: Unranked)",
      "pr": number (default: 0),
      "earnings": "string (default: $0)",
      "winRate": "string (default: N/A)",
      "kd": "string (default: 0.0)",
      "matches": "string (default: 0)"
    }`;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let stats: PlayerStats = {
      rank: "Unranked",
      pr: 0,
      earnings: "$0",
      winRate: "N/A",
      kd: "0.0",
      matches: "0"
    };

    if (response.text) {
      const parsed = cleanAndParseJson<PlayerStats>(response.text);
      if (parsed) {
        stats = {
            rank: parsed.rank || "Unranked",
            pr: typeof parsed.pr === 'number' ? parsed.pr : 0,
            earnings: parsed.earnings || "$0",
            winRate: parsed.winRate || "N/A",
            kd: parsed.kd || "0.0",
            matches: parsed.matches || "0"
        };
      }
    }

    const analysis = await generatePerformanceAnalysis(stats, username);
    stats.analysis = analysis;
    
    return stats;

  } catch (error) {
    console.error("Stats Fetch Error:", error);
    return {
        rank: "Unavailable",
        pr: 0,
        earnings: "$0",
        winRate: "N/A",
        kd: "0.0",
        matches: "0",
        analysis: "Check API Key or connection."
      };
  }
};

/**
 * Fetches the current Fortnite Season Meta.
 */
export const getLiveMetaUpdates = async (): Promise<MetaUpdate | null> => {
  try {
    // Explicitly asking to check for Chapter 7 based on user request
    const prompt = `Search for the absolute LATEST Fortnite Chapter and Season. 
    (Important: The user believes Chapter 7 Season 1 is live. Prioritize looking for Chapter 7 info, otherwise fallback to Chapter 6).
    Find the best 3 meta weapons, main mobility, and map changes.
      
    Return VALID JSON.
    {
        "seasonName": "string",
        "topWeapons": ["string"],
        "mobilityMeta": "string",
        "mapChanges": "string"
    }`;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      return cleanAndParseJson<MetaUpdate>(response.text);
    }
    return null;
  } catch (error) {
    console.error("Meta Fetch Error:", error);
    return null;
  }
};

/**
 * Sends a message to the AI Fortnite Coach.
 */
export const getCoachResponse = async (
  message: string, 
  history: { role: string; parts: string[] }[],
  userContext: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: modelFlash,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are an elite Fortnite Competitive Coach (ABØ).
        User Context: ${userContext}.
        ALWAYS Search for the latest season data (specifically check for Chapter 7 Season 1) before answering meta questions.`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => ({ text: p }))
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't analyze that situation.";
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "Coach AI is currently offline. Please check your API Key configuration.";
  }
};

export const generateRoutine = async (
  hoursPerDay: number,
  weaknesses: string[],
  goals: string
): Promise<Routine | null> => {
  try {
    const prompt = `Create a 1-week Fortnite routine.
    Time: ${hoursPerDay}h/day. Weaknesses: ${weaknesses.join(', ')}. Goal: ${goals}.
    
    USE GOOGLE SEARCH to find REAL Creative Map Codes for the CURRENT Season (Prioritize Chapter 7 Season 1 maps if available).
    
    Return ONLY JSON.
    {
      "generatedAt": "string",
      "focusArea": "string",
      "weeklySchedule": [
        {
          "day": "Monday",
          "focus": "string",
          "activities": [
            {
              "activity": "string",
              "durationMin": number,
              "mapCode": "string (optional)",
              "notes": "string"
            }
          ]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      return cleanAndParseJson<Routine>(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Routine Error:", error);
    return null;
  }
};