import React, { createContext, useContext, useState, useEffect } from "react";

type Screen = "splash" | "home" | "levels" | "match3" | "memory-hub" | "memory-flashcards" | "memory-sequence" | "profile" | "speed-tap" | "math-brain" | "shape-recognition" | "color-memory" | "sudoku";

interface GameState {
  coins: number;
  stars: number;
  unlockedLevels: number;
  currentScreen: Screen;
  activeLevel: number;
  lastLoginDate: string;
  loginStreak: number;
  stats: { timePlayed: number; memoryAccuracy: number; matchesMade: number };
  addCoins: (c: number) => void;
  addStars: (s: number) => void;
  setScreen: (s: Screen) => void;
  unlockLevel: (l: number) => void;
  startLevel: (l: number) => void;
  updateStats: (key: keyof GameState["stats"], val: number) => void;
  claimDailyReward: () => void;
}

const defaultState: Omit<GameState, "addCoins" | "addStars" | "setScreen" | "unlockLevel" | "startLevel" | "updateStats" | "claimDailyReward"> = {
  coins: 0,
  stars: 0,
  unlockedLevels: 1,
  currentScreen: "splash",
  activeLevel: 1,
  lastLoginDate: "",
  loginStreak: 0,
  stats: { timePlayed: 0, memoryAccuracy: 100, matchesMade: 0 }
};

const GameContext = createContext<GameState | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("memory_candy_crush_kids");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed, currentScreen: "splash" };
      }
    } catch {
      // Ignore
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem("memory_candy_crush_kids", JSON.stringify({
      coins: state.coins,
      stars: state.stars,
      unlockedLevels: state.unlockedLevels,
      stats: state.stats,
      lastLoginDate: state.lastLoginDate,
      loginStreak: state.loginStreak
    }));
  }, [state.coins, state.stars, state.unlockedLevels, state.stats, state.lastLoginDate, state.loginStreak]);

  useEffect(() => {
    // Basic time tracker
    const interval = setInterval(() => {
      setState((prev: any) => ({
        ...prev,
        stats: { ...prev.stats, timePlayed: prev.stats.timePlayed + 1 }
      }));
    }, 60000); // add a minute
    return () => clearInterval(interval);
  }, []);

  const addCoins = React.useCallback((c: number) => setState((p: any) => ({ ...p, coins: p.coins + c })), []);
  const addStars = React.useCallback((s: number) => setState((p: any) => ({ ...p, stars: p.stars + s })), []);
  const setScreen = React.useCallback((s: Screen) => setState((p: any) => ({ ...p, currentScreen: s })), []);
  const unlockLevel = React.useCallback((l: number) => setState((p: any) => ({ ...p, unlockedLevels: Math.max(p.unlockedLevels, l) })), []);
  const startLevel = React.useCallback((l: number) => setState((p: any) => ({ ...p, activeLevel: l, currentScreen: "match3" })), []);
  const updateStats = React.useCallback((key: keyof GameState["stats"], val: number) => {
    setState((p: any) => ({ ...p, stats: { ...p.stats, [key]: val } }));
  }, []);

  const claimDailyReward = React.useCallback(() => {
    setState((p: any) => {
        const today = new Date().toDateString();
        return {
            ...p,
            coins: p.coins + 50 * (p.loginStreak + 1), // scale reward
            lastLoginDate: today,
            loginStreak: p.loginStreak + 1
        }
    });
  }, []);

  const providerValue = React.useMemo(() => ({
    ...state, addCoins, addStars, setScreen, unlockLevel, startLevel, updateStats, claimDailyReward
  }), [state, addCoins, addStars, setScreen, unlockLevel, startLevel, updateStats, claimDailyReward]);

  return (
    <GameContext.Provider value={providerValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
