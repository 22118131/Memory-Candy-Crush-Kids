import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGame } from './GameContext';
import { ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
    }
};

const ITEMS = ['🍭', '🍬', '🍩', '🍫'];

const VALID_GRID = [
    [0, 1, 2, 3],
    [2, 3, 0, 1],
    [1, 0, 3, 2],
    [3, 2, 1, 0]
];

export const Sudoku = () => {
    const { setScreen, addCoins } = useGame();
    const [grid, setGrid] = useState<(number | null)[][]>([]);
    const [initialGrid, setInitialGrid] = useState<boolean[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

    const generatePuzzle = () => {
        // shuffle items mapping
        const shuffledIndexes = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        const newGrid = VALID_GRID.map(row => row.map(val => shuffledIndexes[val]));
        
        const puzzleGrid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
        const initGrid: boolean[][] = Array(4).fill(null).map(() => Array(4).fill(false));

        // remove some items
        let removed = 0;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (Math.random() > 0.4) {
                    puzzleGrid[r][c] = newGrid[r][c];
                    initGrid[r][c] = true;
                } else {
                    removed++;
                }
            }
        }
        // Ensure at least some are removed
        if (removed === 0) {
            puzzleGrid[0][0] = null;
            initGrid[0][0] = false;
        }

        setGrid(puzzleGrid);
        setInitialGrid(initGrid);
        setSelectedCell(null);
    };

    useEffect(() => {
        generatePuzzle();
    }, []);

    const checkWin = (currentGrid: (number | null)[][]) => {
        // Check if full
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentGrid[r][c] === null) return false;
            }
        }

        // rows
        for (let r = 0; r < 4; r++) {
            const set = new Set(currentGrid[r]);
            if (set.size !== 4) return false;
        }
        // cols
        for (let c = 0; c < 4; c++) {
            const set = new Set([currentGrid[0][c], currentGrid[1][c], currentGrid[2][c], currentGrid[3][c]]);
            if (set.size !== 4) return false;
        }
        // blocks
        for (let br = 0; br < 2; br++) {
            for (let bc = 0; bc < 2; bc++) {
                const set = new Set([
                    currentGrid[br*2][bc*2], currentGrid[br*2][bc*2+1],
                    currentGrid[br*2+1][bc*2], currentGrid[br*2+1][bc*2+1]
                ]);
                if (set.size !== 4) return false;
            }
        }
        return true;
    };

    const handleCellClick = (r: number, c: number) => {
        if (!initialGrid[r][c]) {
            vibrate();
            setSelectedCell({ r, c });
        }
    };

    const handleItemClick = (itemIdx: number) => {
        if (!selectedCell) return;
        vibrate();
        const newGrid = grid.map(row => [...row]);
        newGrid[selectedCell.r][selectedCell.c] = itemIdx;
        setGrid(newGrid);

        if (checkWin(newGrid)) {
            confetti({ particleCount: 150, spread: 80 });
            setTimeout(() => {
                addCoins(100);
                setScreen('memory-hub');
            }, 2000);
        } else {
            // Find next empty cell for convenience
            let found = false;
            for(let r=0; r<4; r++) {
                for(let c=0; c<4; c++) {
                    if (newGrid[r][c] === null) {
                        setSelectedCell({r, c});
                        found = true;
                        break;
                    }
                }
                if(found) break;
            }
            if(!found) setSelectedCell(null);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center p-6 bg-gradient-to-br from-pink-400 to-purple-500 shadow-2xl relative overflow-hidden">
            <div className="w-full flex justify-between items-center bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-8 shadow-sm border border-white/30">
                <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition shadow-md border-b-2 border-white/20">
                    <ArrowLeft size={24} />
                </button>
                <div className="text-white font-black text-xl uppercase drop-shadow-md">Candy Sudoku</div>
                <div className="w-12"></div>
            </div>

            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border-[6px] border-white/40 shadow-2xl w-full max-w-[320px] aspect-square flex flex-col relative mt-4">
                <div className="absolute inset-0 m-[14px] border-[6px] border-white/80 rounded-2xl pointer-events-none z-10" />
                <div className="absolute top-1/2 left-[14px] right-[14px] h-2 bg-white/80 -translate-y-1/2 z-10 pointer-events-none rounded-full" />
                <div className="absolute left-1/2 top-[14px] bottom-[14px] w-2 bg-white/80 -translate-x-1/2 z-10 pointer-events-none rounded-full" />

                <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-2 p-1 relative z-20">
                    {grid.map((row, r) => row.map((val, c) => (
                        <motion.div
                            key={`${r}-${c}`}
                            whileTap={!initialGrid[r][c] ? { scale: 0.9 } : undefined}
                            onClick={() => handleCellClick(r, c)}
                            className={`flex items-center justify-center text-4xl rounded-xl cursor-pointer transition-colors shadow-sm
                                ${initialGrid[r][c] ? 'bg-black/10' : 'bg-white/80'}
                                ${selectedCell?.r === r && selectedCell?.c === c ? 'ring-4 ring-yellow-400 ring-offset-2 !bg-yellow-100 z-30 shadow-lg scale-105' : ''}
                            `}
                        >
                            {val !== null ? ITEMS[val] : ''}
                        </motion.div>
                    )))}
                </div>
            </div>

            <div className="mt-12 flex gap-4 bg-white/20 p-4 rounded-3xl backdrop-blur-md shadow-xl border border-white/30 w-full justify-center">
                {ITEMS.map((item, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleItemClick(idx)}
                        className={`w-[60px] h-[60px] rounded-2xl bg-white flex items-center justify-center text-[2.5rem] shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-[6px] active:shadow-none transition-all
                            ${!selectedCell ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}
                        `}
                    >
                        {item}
                    </motion.button>
                ))}
            </div>
            
            <div className="mt-8 text-white font-bold text-center bg-black/20 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                Fill the 4x4 grid.<br/>Every row, column, and 2x2 box needs 4 different candies!
            </div>
        </div>
    );
};
