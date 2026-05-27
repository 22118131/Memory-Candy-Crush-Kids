import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from './GameContext';
import { ArrowLeft, Zap, Calculator, Hexagon, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
    }
};

export const SpeedTap = () => {
    const { setScreen, updateStats, addCoins } = useGame();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [activeTarget, setActiveTarget] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setIsPlaying(false);
                    clearInterval(timer);
                    confetti({ particleCount: 100, spread: 70 });
                    setTimeout(() => {
                        addCoins(score * 2);
                        setScreen('memory-hub');
                    }, 2500);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlaying, score, addCoins, setScreen]);

    useEffect(() => {
        if (!isPlaying) return;
        const spawnTimer = setInterval(() => {
            setActiveTarget(Math.floor(Math.random() * 9));
        }, Math.max(400, 1000 - score * 20)); // speeds up
        return () => clearInterval(spawnTimer);
    }, [isPlaying, score]);

    useEffect(() => {
        setIsPlaying(true);
    }, []);

    const handleTap = (index: number) => {
        if (!isPlaying) return;
        if (index === activeTarget) {
            vibrate();
            setScore(s => s + 1);
            setActiveTarget(-1);
        } else {
            // wrong tap
            setScore(s => Math.max(0, s - 1));
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center p-4 bg-gradient-to-br from-orange-400 to-red-500 shadow-2xl relative overflow-hidden">
            <div className="w-full flex justify-between items-center bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-8 shadow-sm border border-white/30">
                <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-white font-bold text-xl uppercase">Speed Tap</h2>
                    <div className="text-white font-black text-sm bg-black/20 px-3 py-1 rounded-full">{timeLeft}s</div>
                </div>
            </div>

            <div className="text-center text-white mb-8">
                <div className="text-4xl font-black">Score: {score}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full p-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <motion.div
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTap(i)}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-5xl cursor-pointer transition-colors shadow-lg
                            ${activeTarget === i ? 'bg-yellow-300 ring-4 ring-white animate-pulse' : 'bg-black/20'}`}
                    >
                        {activeTarget === i ? '⭐' : ''}
                    </motion.div>
                ))}
            </div>
            {!isPlaying && timeLeft === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-white p-8 rounded-[2rem] text-center border-4 border-orange-400">
                        <h2 className="text-3xl font-black text-orange-500 mb-2">Time's Up!</h2>
                        <p className="text-xl font-bold text-gray-700">You scored {score}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const MathBrain = () => {
    const { setScreen, addCoins } = useGame();
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState({ num1: 0, num2: 0, op: '+', answer: 0 });
    const [options, setOptions] = useState<number[]>([]);
    const [level, setLevel] = useState(1);

    const generateQuestion = () => {
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let num1 = Math.floor(Math.random() * (10 * level)) + 1;
        let num2 = Math.floor(Math.random() * (10 * level)) + 1;
        
        if (op === '-' && num1 < num2) {
            const temp = num1; num1 = num2; num2 = temp;
        }
        
        let answer = op === '+' ? num1 + num2 : num1 - num2;
        
        let newOptions = [answer];
        while (newOptions.length < 4) {
            const wrong = answer + Math.floor(Math.random() * 10) - 5;
            if (!newOptions.includes(wrong) && wrong >= 0) newOptions.push(wrong);
        }
        
        setQuestion({ num1, num2, op, answer });
        setOptions(newOptions.sort(() => Math.random() - 0.5));
    };

    useEffect(() => {
        generateQuestion();
    }, [level]);

    const handleAnswer = (opt: number) => {
        vibrate();
        if (opt === question.answer) {
            setScore(s => {
                const ns = s + 1;
                if (ns % 5 === 0) setLevel(l => l + 1);
                return ns;
            });
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            generateQuestion();
        } else {
            // wrong
            setScore(s => Math.max(0, s - 1));
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center p-6 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl relative overflow-hidden">
            <div className="w-full flex justify-between items-center bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-8 shadow-sm">
                <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-white font-bold text-xl uppercase">Math Brain</h2>
                    <div className="text-white font-black text-sm bg-black/20 px-3 py-1 rounded-full">Level {level}</div>
                </div>
                <div className="text-white font-black bg-black/20 px-4 py-2 rounded-xl">🌟 {score}</div>
            </div>

            <div className="flex-1 flex flex-col justify-center w-full gap-8">
                <motion.div 
                    key={question.num1 + question.op + question.num2}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 p-8 rounded-[3rem] text-center shadow-xl border-8 border-teal-300"
                >
                    <div className="text-6xl font-black text-teal-800 tracking-wider font-mono">
                        {question.num1} {question.op} {question.num2}
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    {options.map((opt, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAnswer(opt)}
                            className="bg-white py-6 rounded-3xl text-3xl font-black text-teal-600 shadow-[0_6px_0_rgba(13,148,136,0.6)] active:translate-y-[6px] active:shadow-none"
                        >
                            {opt}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ShapeRecognition = () => {
    const { setScreen, addCoins } = useGame();
    const [score, setScore] = useState(0);
    const [shapes, setShapes] = useState<{id: number, shape: string, color: string, isOdd: boolean}[]>([]);
    
    const SHAPE_ICONS = ['⭐', '🟢', '🟦', '🔺', '💖'];

    const generateShapes = () => {
        const gridCount = 9;
        const mainShape = SHAPE_ICONS[Math.floor(Math.random() * SHAPE_ICONS.length)];
        let oddShape = SHAPE_ICONS[Math.floor(Math.random() * SHAPE_ICONS.length)];
        while (oddShape === mainShape) {
            oddShape = SHAPE_ICONS[Math.floor(Math.random() * SHAPE_ICONS.length)];
        }

        const newShapes = Array.from({ length: gridCount }).map((_, i) => ({
            id: i,
            shape: mainShape,
            color: 'white',
            isOdd: false
        }));

        const oddIndex = Math.floor(Math.random() * gridCount);
        newShapes[oddIndex].shape = oddShape;
        newShapes[oddIndex].isOdd = true;

        setShapes(newShapes);
    };

    useEffect(() => {
        generateShapes();
    }, []);

    const handleTap = (isOdd: boolean) => {
        vibrate();
        if (isOdd) {
            setScore(s => s + 1);
            generateShapes();
            if (score > 0 && score % 5 === 0) {
                confetti({ particleCount: 50 });
            }
        } else {
            setScore(s => Math.max(0, s - 1));
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center p-6 bg-gradient-to-br from-indigo-500 to-purple-800 shadow-2xl relative overflow-hidden">
             <div className="w-full flex justify-between items-center bg-white/10 p-4 rounded-3xl backdrop-blur-md mb-8">
                <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-white font-bold text-xl uppercase tracking-widest">Odd One Out</h2>
                <div className="text-white font-black bg-white/20 px-4 py-2 rounded-xl">Score: {score}</div>
            </div>

            <h3 className="text-white/80 font-bold mb-4 text-lg">Find the different shape!</h3>

            <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] aspect-square">
                <AnimatePresence mode="popLayout">
                    {shapes.map((s) => (
                        <motion.div
                            key={s.id}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleTap(s.isOdd)}
                            className="bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-5xl cursor-pointer shadow-lg hover:bg-white/30 transition-colors border-2 border-white/10"
                        >
                            {s.shape}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
