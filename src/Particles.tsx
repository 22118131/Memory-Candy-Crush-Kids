import React from 'react';
import { motion } from 'motion/react';

export const ParticlesBackground = () => {
    // Generate some random positions for particles
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: Math.random() * 20 + 10,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 5,
        type: ['🍬', '🍭', '✨', '⭐'][Math.floor(Math.random() * 4)]
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute opacity-30 text-2xl"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
                    animate={{ 
                        y: ['0vh', '100vh'],
                        rotate: [0, 360],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {p.type}
                </motion.div>
            ))}
        </div>
    );
};
