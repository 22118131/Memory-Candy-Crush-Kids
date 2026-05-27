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

export const ColorMemory = () => {
    const { setScreen } = useGame();
    const [score, setScore] = useState(0);
    const [targetColor, setTargetColor] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    
    // Hardcoded kid-friendly colors
    const COLORS = [
        { name: 'Red', hex: '#ef4444' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Yellow', hex: '#eab308' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Pink', hex: '#ec4899' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Cyan', hex: '#06b6d4' }
    ];

    const generateRound = () => {
        const shuffled = [...COLORS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        setOptions(selected.map(c => c.hex));
        setTargetColor(selected[Math.floor(Math.random() * selected.length)].name);
    };

    useEffect(() => {
        generateRound();
    }, []);

    const handleTap = (hex: string) => {
        vibrate();
        const correctHex = COLORS.find(c => c.name === targetColor)?.hex;
        if (hex === correctHex) {
            setScore(s => s + 1);
            generateRound();
            if (score > 0 && score % 5 === 0) confetti();
        } else {
            setScore(s => Math.max(0, s - 1));
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center p-6 bg-slate-900 shadow-2xl relative overflow-hidden">
            <div className="w-full flex justify-between items-center bg-white/10 p-4 rounded-3xl backdrop-blur-md mb-8">
                <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition">
                    <ArrowLeft size={24} />
                </button>
                <div className="text-white font-black bg-white/20 px-4 py-2 rounded-xl text-lg">Score: {score}</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full gap-12">
                <div className="text-center">
                    <h2 className="text-white text-2xl font-bold mb-2 opacity-80">Tap the color:</h2>
                    <motion.div 
                        key={targetColor}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black text-white px-8 py-4 bg-white/10 rounded-full border-4 border-white/20 uppercase tracking-widest"
                    >
                        {targetColor}
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-[280px]">
                    {options.map((hex, i) => (
                        <motion.button
                            key={i + hex}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTap(hex)}
                            className="aspect-square rounded-full shadow-[0_8px_0_rgba(0,0,0,0.5)] active:translate-y-[8px] active:shadow-none border-4 border-white/20"
                            style={{ backgroundColor: hex }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
