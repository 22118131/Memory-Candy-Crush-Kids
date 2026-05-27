import React from 'react';
import { useGame } from './GameContext';
import { Splash, Home, LevelSelection, Profile, MemoryHub } from './Screens';
import { Match3Game } from './Match3Game';
import { MemoryFlashcards, MemorySequence } from './MemoryGames';
import { SpeedTap, MathBrain, ShapeRecognition } from './MoreMemoryGames';
import { ColorMemory } from './ColorMemory';
import { Sudoku } from './Sudoku';

export default function App() {
  const { currentScreen } = useGame();

  return (
    <div className="w-full h-full min-h-screen bg-black">
      {currentScreen === 'splash' && <Splash />}
      {currentScreen === 'home' && <Home />}
      {currentScreen === 'levels' && <LevelSelection />}
      {currentScreen === 'match3' && <Match3Game />}
      {currentScreen === 'memory-hub' && <MemoryHub />}
      {currentScreen === 'memory-flashcards' && <MemoryFlashcards />}
      {currentScreen === 'memory-sequence' && <MemorySequence />}
      {currentScreen === 'speed-tap' && <SpeedTap />}
      {currentScreen === 'math-brain' && <MathBrain />}
      {currentScreen === 'shape-recognition' && <ShapeRecognition />}
      {currentScreen === 'color-memory' && <ColorMemory />}
      {currentScreen === 'sudoku' && <Sudoku />}
      {currentScreen === 'profile' && <Profile />}
    </div>
  );
}
