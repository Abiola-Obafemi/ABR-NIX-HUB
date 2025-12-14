import { GoogleGenAI, Type } from "@google/genai";
import { Routine, MetaUpdate, PlayerStats } from "../types";

// Helper to safely get API Key in Browser (Vite) or Node environments
const getApiKey = () => {
  let key = '';
  try {
    // Check for Vite (Browser)
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}

  if (!key) {
    try {
      // Check for Node/Webpack (Process)
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        key = process.env.API_KEY;
      }
    } catch (e) {}
  }
  return key;
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const modelFlash = 'gemini-2.5-flash';

// Helper to clean markdown code blocks from JSON strings
const cleanAndParseJson = <T>(text: string): T | null => {
  try {
    let clean = text.trim();
    // Remove markdown code blocks if present (e.g. ```json ... ```)
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
        - Earnings: ${stats.earnings}
        - Win Rate: ${stats.winRate}
        - K/D: ${stats.kd}
        - Matches: ${stats.matches}

        Provide a 1-sentence, high-impact piece of advice. 
        Example logic: 
        - High KD but low Win Rate? -> "Stop W-keying mid-game and focus on positioning."
        - Low KD? -> "Prioritize aim training and taking smarter right-hand peeks."
        - Low Matches? -> "You need more arena reps to build consistency."
        
        Keep it direct and under 30 words.`;

        const response = await ai.models.generateContent({
            model: modelFlash,
            contents: prompt,
        });
        
        return response.text || "Play more ranked matches to generate actionable data.";
    } catch (e) {
        return "Focus on mechanics and game sense to improve across the board.";
    }
}

/**
 * Searches for a player's real stats using Google Search Grounding.
 */
export const fetchPlayerStats = async (username: string): Promise<PlayerStats> => {
  try {
    // We construct a specific prompt to help the model find the right data.
    const prompt = `
    I need you to search for the public Fortnite stats of user "${username}".
    
    1.  **Search Query**: Run a Google Search for "Fortnite Tracker ${username} stats" or "Fortnite ranked stats ${username}".
    2.  **Analyze**: Look at the titles and snippets from sites like fortnitetracker.com.
    3.  **Extract**: I need the following numbers. If you find them, extract them exactly.
        *   Power Ranking (PR) - Look for "PR", "Power Ranking".
        *   Rank - Look for "Elite", "Champion", "Unreal", "Diamond", "Platinum".
        *   Earnings - Look for "$" amount.
        *   K/D Ratio - Look for "KD", "K/D".
        *   Win Rate - Look for "%" win rate.
        *   Matches - Look for "Matches Played".

    4.  **Fallback**: If you cannot find *any* specific numbers for "${username}" (maybe the profile is private), do NOT make up numbers. Return "N/A" for strings and 0 for numbers.

    RETURN JSON ONLY:
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

    // Generate analysis based on the found stats
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
        analysis: "Could not analyze stats."
      };
  }
};

/**
 * Fetches the current Fortnite Season Meta using Google Search Grounding.
 */
export const getLiveMetaUpdates = async (): Promise<MetaUpdate | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: `Search for the current Fortnite Chapter and Season, the top 3 meta weapons right now, the main mobility item, and a major map change.
      
      Return the result as a valid JSON object with the following structure:
      {
        "seasonName": "string",
        "topWeapons": ["string"],
        "mobilityMeta": "string",
        "mapChanges": "string"
      }
      
      Do not output markdown code blocks.`,
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
    return {
      seasonName: "Data Unavailable",
      topWeapons: ["Unknown"],
      mobilityMeta: "Unknown",
      mapChanges: "Could not fetch live data."
    };
  }
};

/**
 * Sends a message to the AI Fortnite Coach with Search Grounding.
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
        tools: [{ googleSearch: {} }], // Enable search for Coach
        systemInstruction: `You are an elite Fortnite Competitive Coach. 
        User Context: ${userContext}.
        
        Guidelines:
        - ALWAYS use the Google Search tool to verify the current meta (weapons, map, stats) if you are unsure.
        - Be direct, concise, and professional.
        - Provide specific creative map codes if asked for drills.
        - Focus on the CURRENT season.`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => ({ text: p }))
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't analyze that situation. Try rephrasing.";
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return "Connection to the AI Coach grid is unstable. Check your API Key.";
  }
};

/**
 * Generates a personalized training routine with real Map Codes found via Search.
 */
export const generateRoutine = async (
  hoursPerDay: number,
  weaknesses: string[],
  goals: string
): Promise<Routine | null> => {
  try {
    const prompt = `Create a 1-week structured Fortnite training routine for a player.
    - Time available: ${hoursPerDay} hours/day
    - Weaknesses: ${weaknesses.join(', ')}
    - Goal: ${goals}
    
    IMPORTANT: Use Google Search to find ACTUAL, POPULAR Creative Map Codes for the specific drills (Aim, Mechanics, Piece Control) relevant to the current season.
    
    Output the result as a raw JSON object (no markdown) with this structure:
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