import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from './GameContext';
import { Star, ArrowLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CANDIES = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'];

export interface CandyItem {
  id: string;
  type: string;
}

let candyIdCounter = 0;
const getId = () => `candy_${candyIdCounter++}`;

const createBoard = (size: number = 6) => {
  const board: CandyItem[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CandyItem[] = [];
    for (let c = 0; c < size; c++) {
      let candy = CANDIES[0];
      do {
        candy = CANDIES[Math.floor(Math.random() * CANDIES.length)];
      } while (
        (c >= 2 && row[c - 1].type === candy && row[c - 2].type === candy) ||
        (r >= 2 && board[r - 1][c].type === candy && board[r - 2][c].type === candy)
      );
      row.push({ id: getId(), type: candy });
    }
    board.push(row);
  }
  return board;
};

const checkMatches = (board: (CandyItem | null)[][]) => {
  const matches = new Set<string>();
  const rows = board.length;
  const cols = board[0].length;

  // Horizontal matches
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 2; c++) {
      const item = board[r][c];
      if (!item) continue;
      if (
        board[r][c + 1]?.type === item.type &&
        board[r][c + 2]?.type === item.type
      ) {
        matches.add(`${r},${c}`);
        matches.add(`${r},${c+1}`);
        matches.add(`${r},${c+2}`);
        let k = c + 3;
        while (k < cols && board[r][k]?.type === item.type) {
          matches.add(`${r},${k}`);
          k++;
        }
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const item = board[r][c];
      if (!item) continue;
      if (
        board[r + 1][c]?.type === item.type &&
        board[r + 2][c]?.type === item.type
      ) {
        matches.add(`${r},${c}`);
        matches.add(`${r+1},${c}`);
        matches.add(`${r+2},${c}`);
        let k = r + 3;
        while (k < rows && board[k][c]?.type === item.type) {
          matches.add(`${k},${c}`);
          k++;
        }
      }
    }
  }
  return matches;
};

export const Match3Game = () => {
  const { setScreen, updateStats, addStars, activeLevel } = useGame();
  const [board, setBoard] = useState<(CandyItem | null)[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(15 + activeLevel * 5);
  const [isProcessing, setIsProcessing] = useState(false);
  const size = 6;

  useEffect(() => {
    setBoard(createBoard(size));
  }, []);

  const processGravity = useCallback(async (currentBoard: (CandyItem | null)[][]) => {
    setIsProcessing(true);
    let tempBoard = currentBoard.map(row => [...row]);
    let totalScoreThisMove = 0;
    let combo = 1;

    let hasMatches = true;
    while (hasMatches) {
      const matchSet = checkMatches(tempBoard);
      if (matchSet.size === 0) {
        hasMatches = false;
        break;
      }

      totalScoreThisMove += matchSet.size * 10 * combo;
      combo++;

      // Remove matches
      matchSet.forEach(pos => {
        const [r, c] = pos.split(',').map(Number);
        tempBoard[r][c] = null;
      });
      setBoard([...tempBoard.map(row => [...row])]);
      
      // Wait for pop animation
      await new Promise(res => setTimeout(res, 300));

      // Gravity
      for (let c = 0; c < size; c++) {
        let emptyCount = 0;
        for (let r = size - 1; r >= 0; r--) {
          if (tempBoard[r][c] === null) {
            emptyCount++;
          } else if (emptyCount > 0) {
            tempBoard[r + emptyCount][c] = tempBoard[r][c];
            tempBoard[r][c] = null;
          }
        }
        for (let r = 0; r < emptyCount; r++) {
          tempBoard[r][c] = {
            id: getId(),
            type: CANDIES[Math.floor(Math.random() * CANDIES.length)],
          };
        }
      }
      setBoard([...tempBoard.map(row => [...row])]);
      await new Promise(res => setTimeout(res, 300));
    }

    if (totalScoreThisMove > 0) {
      setScore(s => s + totalScoreThisMove);
      updateStats("matchesMade", totalScoreThisMove / 10); // roughly
      if (combo > 2) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#ff00ea', '#00e1ff', '#ffe100'] });
      }
    }

    setIsProcessing(false);
  }, [updateStats]);

  const handleSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing) return;
    
    // Validate adjacency
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) {
      setSelected({ r: r2, c: c2 });
      return;
    }

    setIsProcessing(true);
    let tempBoard = board.map(row => [...row]);
    
    // Swap visually
    const temp = tempBoard[r1][c1];
    tempBoard[r1][c1] = tempBoard[r2][c2];
    tempBoard[r2][c2] = temp;
    setBoard([...tempBoard.map(row => [...row])]);
    
    await new Promise(res => setTimeout(res, 250)); // Swap animation time

    const matches = checkMatches(tempBoard);
    if (matches.size > 0) {
      setMovesLeft(m => m - 1);
      setSelected(null);
      await processGravity(tempBoard);
    } else {
      // Revert swap
      const tempRev = tempBoard[r1][c1];
      tempBoard[r1][c1] = tempBoard[r2][c2];
      tempBoard[r2][c2] = tempRev;
      setBoard([...tempBoard.map(row => [...row])]);
      setSelected(null);
      setIsProcessing(false);
    }
  };

  const handleCandyClick = (r: number, c: number) => {
    if (isProcessing) return;
    if (!selected) {
      setSelected({ r, c });
    } else {
      if (selected.r === r && selected.c === c) {
        setSelected(null); // deselect
      } else {
        handleSwap(selected.r, selected.c, r, c);
      }
    }
  };

  useEffect(() => {
    if (movesLeft <= 0 && !isProcessing) {
      addStars(score > 1000 ? 3 : score > 500 ? 2 : 1);
      confetti({ particleCount: 150, zIndex: 9999 });
      setTimeout(() => setScreen('home'), 2000);
    }
  }, [movesLeft, isProcessing, score, addStars, setScreen]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto items-center p-4 bg-gradient-to-b from-purple-400 via-pink-400 to-rose-300 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-white/30 p-4 rounded-3xl backdrop-blur-md mb-6 shadow-sm border border-white/40">
        <button onClick={() => setScreen('home')} className="p-3 bg-white text-purple-600 rounded-full shadow-lg hover:scale-105 transition">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-bold text-xl tracking-wider">Level {activeLevel}</h2>
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full text-purple-900 font-bold">
            <Sparkles size={16} className="text-yellow-400" />
            <span>Score: {score}</span>
          </div>
        </div>
        <div className="flex flex-col items-center bg-white p-2 rounded-2xl shadow-md border-b-4 border-gray-200 min-w-[60px]">
          <span className="text-xs text-gray-500 font-bold uppercase">Moves</span>
          <span className="text-2xl font-black text-rose-500">{movesLeft}</span>
        </div>
      </div>

      {/* Board Layout */}
      <div className="relative bg-white/20 p-2 rounded-[2rem] border-[4px] border-white/50 shadow-inner backdrop-blur-sm w-full aspect-square">
        <div
          className="grid gap-1 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((candy, c) => (
              <div
                key={`${r}-${c}`}
                className={`relative flex items-center justify-center rounded-xl transition-all duration-200 ${
                  selected?.r === r && selected?.c === c ? 'bg-white/50 ring-4 ring-yellow-400 ring-offset-2 scale-110 z-10 shadow-lg' : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => handleCandyClick(r, c)}
              >
                <AnimatePresence mode="popLayout">
                  {candy && (
                    <motion.div
                      layoutId={candy.id}
                      initial={{ scale: 0, opacity: 0, y: -20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, filter: 'blur(4px)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, mass: 0.8 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.85 }}
                      className="absolute inset-0 flex items-center justify-center text-[2.5rem] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] cursor-pointer select-none"
                    >
                      {candy.type}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
        
        {movesLeft <= 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[2rem] backdrop-blur-md z-50 flex-col gap-4 text-white p-8 text-center"
            >
               <h1 className="text-4xl font-black text-yellow-300 animate-bounce">Level Complete!</h1>
               <p className="text-2xl font-bold">You scored {score}!</p>
            </motion.div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 text-white font-bold tracking-widest text-lg drop-shadow-md">
        Match 3 or more to score!
      </div>
    </div>
  );
};
