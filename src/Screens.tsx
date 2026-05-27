import React from 'react';
import { motion } from 'motion/react';
import { useGame } from './GameContext';
import { Play, Brain, Trophy, Coins, Star, Settings, ArrowLeft } from 'lucide-react';
import { ParticlesBackground } from './Particles';

const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
    }
};

export const Splash = () => {
  const { setScreen } = useGame();
  
  React.useEffect(() => {
    const t = setTimeout(() => setScreen('home'), 2500);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto items-center justify-center bg-gradient-to-b from-cyan-400 to-blue-500 overflow-hidden relative">
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative"
      >
        <div className="text-9xl filter drop-shadow-xl z-10 relative">🍬</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl -z-0"></div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="mt-8 text-center text-white"
      >
        <h1 className="text-5xl font-black tracking-tighter drop-shadow-md">Candy Crush<br /> <span className="text-yellow-300">Kids!</span></h1>
        <p className="font-bold text-lg mt-4 opacity-90 tracking-widest uppercase">Memory Boost</p>
      </motion.div>
    </div>
  );
};

export const Home = () => {
  const { setScreen, coins, stars, lastLoginDate, loginStreak, claimDailyReward } = useGame();
  
  const today = new Date().toDateString();
  const showDailyPopup = lastLoginDate !== today;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto p-6 bg-[#fdf2f8] relative overflow-hidden">
      <ParticlesBackground />
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full z-10 mb-8 mt-4">
        <div className="flex gap-3">
          <div className="flex justify-center items-center gap-1.5 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-black shadow-[0_4px_0_#b48600]">
            <Coins size={18} fill="currentColor" />
            {coins}
          </div>
          <div className="flex justify-center items-center gap-1.5 bg-purple-500 text-white px-4 py-2 rounded-full font-black shadow-[0_4px_0_#6b21a8]">
            <Star size={18} fill="currentColor" className="text-yellow-300" />
            {stars}
          </div>
        </div>
        <button onClick={() => setScreen('profile')} className="p-3 bg-white text-gray-700 rounded-full shadow-[0_4px_0_#d1d5db] active:translate-y-[4px] active:shadow-none transition-all">
          <Settings size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10">
        <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-8xl drop-shadow-lg">
          🍭
        </motion.div>
        
        <div className="w-full flex flex-col gap-4">
          <button 
             onClick={() => setScreen('levels')}
             className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl shadow-[0_8px_0_#9f1239] active:translate-y-[8px] active:shadow-none transition-all flex items-center justify-center gap-3 text-white font-black text-2xl uppercase tracking-wider"
          >
            <Play fill="currentColor" size={28} />
            Play Game
          </button>
          
          <button 
             onClick={() => setScreen('memory-hub')}
             className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl shadow-[0_8px_0_#1e3a8a] active:translate-y-[8px] active:shadow-none transition-all flex items-center justify-center gap-3 text-white font-black text-2xl uppercase tracking-wider"
          >
            <Brain size={28} />
            Memory Games
          </button>
        </div>
      </div>

      {showDailyPopup && (
         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-6">
             <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-white rounded-[2rem] p-8 flex flex-col items-center w-full max-w-sm shadow-2xl relative border-4 border-yellow-400"
             >
                 <div className="absolute -top-12 bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg">🎁</div>
                 <h2 className="text-3xl font-black mt-8 text-purple-600 tracking-wide">Daily Reward!</h2>
                 <p className="font-bold text-gray-500 mt-2">Day {loginStreak + 1} Streak</p>
                 
                 <div className="bg-yellow-50 rounded-2xl p-6 mt-6 w-full flex items-center justify-center gap-4">
                     <Coins size={36} className="text-yellow-500" fill="currentColor" />
                     <span className="text-4xl font-black text-yellow-600">+{50 * (loginStreak + 1)}</span>
                 </div>
                 
                 <button 
                    onClick={claimDailyReward}
                    className="mt-8 w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl text-white font-black text-xl shadow-[0_6px_0_#047857] active:translate-y-[6px] active:shadow-none transition-all"
                 >
                     Claim
                 </button>
             </motion.div>
         </div>
      )}
      
      {/* Decorative background blocks */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-20 -translate-y-20 z-0 pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-20 z-0 pointer-events-none"></div>
    </div>
  );
};

export const MemoryHub = () => {
    const { setScreen } = useGame();
    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative overflow-y-auto no-scrollbar pb-20">
            <div className="flex items-center gap-4 text-white mb-6 mt-4 z-10 sticky top-0 bg-transparent py-2 backdrop-blur-sm rounded-full px-2">
                <button onClick={() => setScreen('home')} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur">
                   <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-widest">Brain Games</h1>
            </div>

            <div className="flex-1 flex flex-col gap-4 z-10">
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('memory-flashcards'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">🃏</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Flashcards</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Match hidden pairs!</p>
                    </div>
                </motion.button>
                
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('memory-sequence'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">✨</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Sequence</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Repeat glowing patterns!</p>
                    </div>
                </motion.button>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('speed-tap'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">⚡</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Speed Tap</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Tap targets quickly!</p>
                    </div>
                </motion.button>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('math-brain'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">🧮</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Math Brain</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Quick equations!</p>
                    </div>
                </motion.button>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('shape-recognition'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">🔺</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Odd Shape</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Find the different shape!</p>
                    </div>
                </motion.button>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('color-memory'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">🎨</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Color Memory</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Match the correct color!</p>
                    </div>
                </motion.button>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(); setScreen('sudoku'); }}
                    className="w-full bg-white rounded-3xl p-5 shadow-xl flex items-center gap-5 border-b-4 border-gray-200"
                >
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">🎲</div>
                    <div className="text-left">
                        <h2 className="text-xl font-black text-gray-800">Candy Sudoku</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">4x4 kids brain puzzle!</p>
                    </div>
                </motion.button>
            </div>
            
            <div className="fixed top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-fuchsia-500/20 rounded-full filter blur-3xl pointer-events-none"></div>
        </div>
    )
}

export const LevelSelection = () => {
    const { setScreen, startLevel, unlockedLevels } = useGame();
    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-br from-[#7dd3fc] to-[#3b82f6] p-6 relative">
            <div className="flex items-center gap-4 text-white mb-8 mt-4">
                <button onClick={() => setScreen('home')} className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur">
                   <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-widest">Select Level</h1>
            </div>
            
            <div className="flex-1 w-full relative overflow-y-auto pb-20 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                <div className="absolute top-0 left-1/2 w-2 h-[4500px] bg-white/30 -translate-x-1/2 rounded-full hidden"></div>
                <div className="flex flex-col-reverse justify-start items-center gap-12 pt-12 min-h-[max-content]">
                    {Array.from({ length: 50 }).map((_, i) => {
                        const level = i + 1;
                        const isUnlocked = level <= unlockedLevels;
                        // Calculate horizontal offset to make a winding path
                        const offset = Math.sin(i * 1.2) * 80;
                        
                        return (
                            <motion.div 
                                key={level}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.1, type: "spring" }}
                                className="relative flex justify-center w-full"
                                style={{ transform: `translateX(${offset}px)` }}
                            >
                                <motion.button
                                   whileHover={isUnlocked ? { scale: 1.15, rotate: 5 } : undefined}
                                   whileTap={isUnlocked ? { scale: 0.9 } : undefined}
                                   onClick={() => isUnlocked && startLevel(level)}
                                   className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-[0_8px_0_rgba(0,0,0,0.2)] transition-colors z-10
                                        ${isUnlocked 
                                            ? 'bg-gradient-to-t from-yellow-500 to-yellow-300 text-yellow-900 border-4 border-white' 
                                            : 'bg-white/20 text-white/40 cursor-not-allowed border-4 border-white/20'}`}
                                >
                                    {level}
                                </motion.button>
                                {/* Dotted line connector to next level */}
                                {i < 49 && (
                                    <svg className="absolute w-[200px] h-32 top-[-70px] left-1/2 -translate-x-1/2 -z-10 pointer-events-none" preserveAspectRatio="none">
                                        <path 
                                           d={`M 100 90 Q ${100 - (Math.sin((i+1)*1.2)*80 - offset)/2} 40 ${100 - (Math.sin((i+1)*1.2)*80 - offset)} 10`}
                                           fill="none" 
                                           stroke="rgba(255,255,255,0.4)" 
                                           strokeWidth="6" 
                                           strokeDasharray="10, 10" 
                                        />
                                    </svg>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

export const Profile = () => {
    const { setScreen, stats } = useGame();
    return (
        <div className="flex flex-col h-screen max-w-md mx-auto items-center justify-center p-8 bg-gray-50">
            <h1 className="text-3xl font-black text-gray-800 mb-8">Parent Dashboard</h1>
            <div className="w-full bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-gray-500 font-bold">Time Played</span>
                    <span className="text-2xl font-black text-purple-600">{stats.timePlayed} min</span>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-gray-500 font-bold">Matches Made</span>
                    <span className="text-2xl font-black text-rose-500">{Math.floor(stats.matchesMade)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Memory Accuracy</span>
                    <span className="text-2xl font-black text-blue-500">{stats.memoryAccuracy}%</span>
                </div>
            </div>
            <button onClick={() => setScreen('home')} className="mt-12 px-8 py-4 bg-gray-200 rounded-full font-bold text-gray-700 w-full active:bg-gray-300">
                Back to Home
            </button>
        </div>
    )
}
