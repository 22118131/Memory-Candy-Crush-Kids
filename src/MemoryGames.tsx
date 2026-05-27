import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from './GameContext';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';

const EMOTICONS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryFlashcards = () => {
  const { setScreen, updateStats, addCoins, activeLevel } = useGame();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [matchesCount, setMatchesCount] = useState(0);

  useEffect(() => {
    // Generate Pairs based on level
    const pairCount = Math.min(4 + activeLevel, 8); 
    const usedIcons = EMOTICONS.slice(0, pairCount);
    const generatedCards = [...usedIcons, ...usedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: true, // Preview at start
        isMatched: false,
      }));
    
    setCards(generatedCards);
    setIsLocked(true);

    // Hide cards after 2 seconds preview
    const timer = setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setIsLocked(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [activeLevel]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    const newCards = cards.map(c => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);
    setFlippedIds([...flippedIds, id]);

    if (flippedIds.length === 1) {
      setIsLocked(true);
      const firstCard = newCards.find(c => c.id === flippedIds[0]);
      const secondCard = newCards.find(c => c.id === id);

      if (firstCard?.icon === secondCard?.icon) {
        // Match found!
        setTimeout(() => {
          setCards(prev =>
            prev.map(c => (c.id === firstCard.id || c.id === secondCard.id ? { ...c, isMatched: true } : c))
          );
          setMatchesCount(m => m + 1);
          setFlippedIds([]);
          setIsLocked(false);
          updateStats("memoryAccuracy", 100); // simplify stats
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(c => (c.id === firstCard?.id || c.id === secondCard?.id ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && matchesCount === cards.length / 2) {
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        addCoins(50);
        setScreen('home');
      }, 2500);
    }
  }, [matchesCount, cards.length, addCoins, setScreen]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto items-center p-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-white/30 p-4 rounded-3xl backdrop-blur-md mb-8 shadow-sm border border-white/40 border-t-white/60">
        <button onClick={() => setScreen('home')} className="p-3 bg-white text-indigo-600 rounded-full shadow-lg hover:scale-105 transition shrink-0">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-white font-bold text-xl tracking-wider uppercase">Memory Game</h2>
          <div className="flex items-center gap-2 bg-indigo-900/40 px-4 py-1.5 rounded-full text-white font-bold mt-1 text-sm">
            <BrainCircuit size={16} className="text-green-300" />
            <span>Find the Pairs</span>
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="w-full relative aspect-square">
        <div 
           className="grid gap-3 w-full h-full bg-white/10 p-4 rounded-3xl backdrop-blur-sm border-2 border-white/20 shadow-inner"
           style={{
             gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, minmax(0, 1fr))`
           }}
        >
          {cards.map(card => (
            <motion.div
              key={card.id}
              whileTap={!card.isFlipped ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card.id)}
              className="relative w-full h-full perspective-1000"
              style={{ perspective: 1000 }}
            >
              <motion.div
                initial={false}
                animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front (Hidden Face) */}
                <div 
                   className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl shadow-md border-b-4 border-blue-600 flex items-center justify-center text-3xl font-bold text-white/50"
                   style={{ backfaceVisibility: 'hidden' }}
                >
                   ?
                </div>
                {/* Back (Revealed Face) */}
                <div 
                   className="absolute inset-0 bg-white rounded-2xl shadow-lg border-b-4 border-gray-200 flex items-center justify-center text-5xl"
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <motion.div
                    animate={card.isMatched ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: card.isMatched ? 0.4 : 1 }}
                  >
                    {card.icon}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {matchesCount === cards.length / 2 && cards.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-white flex items-center justify-center rounded-[2rem] shadow-2xl flex-col gap-4 text-purple-900 p-8 text-center border-4 border-fuchsia-400 z-50 mx-4"
            >
               <h1 className="text-4xl font-black text-rose-500">Amazing Memory!</h1>
               <p className="text-xl font-bold">+50 Coins</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const MemorySequence = () => {
  const { setScreen, updateStats, addCoins, activeLevel } = useGame();
  const sequenceLengthTarget = Math.min(3 + activeLevel, 8); // Start at 4, scales up
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [stage, setStage] = useState<'waiting' | 'observing' | 'playing' | 'success' | 'fail'>('waiting');

  const PADS = [
    { id: 0, color: 'bg-rose-500', active: 'bg-rose-300 shadow-[0_0_40px_rgba(251,113,133,0.8)]' },
    { id: 1, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_40px_rgba(147,197,253,0.8)]' },
    { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200 shadow-[0_0_40px_rgba(253,224,71,0.8)]' },
    { id: 3, color: 'bg-emerald-500', active: 'bg-emerald-300 shadow-[0_0_40px_rgba(110,231,183,0.8)]' },
  ];

  const generateSequence = () => {
    const newSeq = [];
    for (let i = 0; i < sequenceLengthTarget; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
  };

  const playSequence = async () => {
    setStage('observing');
    setIsPlayingSequence(true);
    setPlayerSequence([]);
    
    // Short delay before starting
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < sequence.length; i++) {
        setActivePad(sequence[i]);
        await new Promise(r => setTimeout(r, 500)); // pad lit time
        setActivePad(null);
        await new Promise(r => setTimeout(r, 250)); // pause between
    }

    setIsPlayingSequence(false);
    setStage('playing');
  };

  useEffect(() => {
    if (stage === 'waiting') {
        generateSequence();
        setTimeout(playSequence, 500);
    }
  }, [stage]);

  const handlePadClick = (id: number) => {
    if (stage !== 'playing') return;
    
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    // Check if correct so far
    if (newPlayerSeq[newPlayerSeq.length - 1] !== sequence[newPlayerSeq.length - 1]) {
        // Failed
        setStage('fail');
        updateStats("memoryAccuracy", 50); // slight penalty avg for fail
        setTimeout(() => {
            setStage('waiting');
        }, 2000);
        return;
    }

    // Check if won
    if (newPlayerSeq.length === sequence.length) {
        setStage('success');
        updateStats("memoryAccuracy", 100);
        confetti({ particleCount: 150, zIndex: 9999, spread: 80 });
        setTimeout(() => {
            addCoins(100);
            setScreen('memory-hub');
        }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto items-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-white/10 p-4 rounded-3xl backdrop-blur-md mb-8 shadow-sm border border-white/20">
        <button onClick={() => setScreen('memory-hub')} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition shrink-0">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-white font-bold text-xl tracking-wider uppercase">Sequence</h2>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white/70 font-bold mt-1 text-sm bg-black/20">
            <span>Level {activeLevel}</span>
          </div>
        </div>
      </div>

      <div className="text-white text-center mb-8 h-12 flex items-center justify-center">
          {stage === 'observing' && <div className="text-2xl font-black text-yellow-300 animate-pulse">Watch carefully...</div>}
          {stage === 'playing' && <div className="text-2xl font-black text-green-400">Your turn!</div>}
          {stage === 'fail' && <div className="text-2xl font-black text-rose-500 uppercase tracking-widest">Wrong! Try again.</div>}
          {stage === 'success' && <div className="text-3xl font-black text-cyan-300 uppercase tracking-widest">Awesome!</div>}
      </div>

      <div className="relative aspect-square w-[80%] max-w-[300px] bg-black/40 p-4 rounded-full border-8 border-slate-800 shadow-2xl flex items-center justify-center">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full rounded-full overflow-hidden rotate-45 transform p-2">
              {PADS.map((pad, idx) => {
                  let roundedClass = '';
                  if (idx === 0) roundedClass = 'rounded-tl-[100px] border-t-4 border-l-4 border-white/20';
                  if (idx === 1) roundedClass = 'rounded-tr-[100px] border-t-4 border-r-4 border-white/20';
                  if (idx === 2) roundedClass = 'rounded-bl-[100px] border-b-4 border-l-4 border-white/20';
                  if (idx === 3) roundedClass = 'rounded-br-[100px] border-b-4 border-r-4 border-white/20';

                  const isLit = activePad === pad.id;

                  return (
                      <motion.div
                          key={pad.id}
                          whileTap={stage === 'playing' ? { scale: 0.95 } : {}}
                          onClick={() => handlePadClick(pad.id)}
                          className={`
                              w-full h-full cursor-pointer transition-colors duration-150
                              ${roundedClass}
                              ${isLit ? pad.active : pad.color}
                          `}
                          style={{ filter: isLit ? 'brightness(1.5)' : 'brightness(0.8)' }}
                      />
                  )
              })}
          </div>
          <div className="absolute inset-0 m-auto w-24 h-24 bg-slate-800 rounded-full border-4 border-black flex items-center justify-center shadow-inner z-10">
                <div className="text-2xl font-black text-white/50">{playerSequence.length}/{sequence.length || sequenceLengthTarget}</div>
          </div>
      </div>
    </div>
  );
};

