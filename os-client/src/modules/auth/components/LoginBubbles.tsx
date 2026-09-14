import React, { useState, useEffect } from 'react';
import styles from './LoginBubbles.module.css';

interface DynamicBubble {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  dx: string;
  isCenter?: boolean;
  key: number;
}

/** Gerador de microbolhas de fermentação */
const createDynamicBubble = (id: number, isInitial = false, totalCount = 16): DynamicBubble => {
  const rawLeft = Math.floor(Math.random() * 90) + 5;
  const isCenter = rawLeft >= 26 && rawLeft <= 74;

  const isMicro = Math.random() < 0.68;
  const size = isMicro
    ? (Math.random() * 4.5 + 3.0).toFixed(1)
    : (Math.random() * 6.5 + 7.5).toFixed(1);

  const duration = (Math.random() * 11 + 11).toFixed(1);
  const dx = (Math.random() * 60 - 30).toFixed(0);

  const initialOffset = (id / totalCount) * 16.0 + Math.random() * 2.0;
  const delay = isInitial ? `-${initialOffset.toFixed(1)}s` : `${(Math.random() * 4.5 + 0.2).toFixed(1)}s`;

  return {
    id,
    left: `${rawLeft}%`,
    size: `${size}px`,
    duration: `${duration}s`,
    delay,
    dx: `${dx}px`,
    isCenter,
    key: Date.now() + Math.random() + id,
  };
};

/** Componente da animação de Microbolhas de Fermentação */
export const LoginBubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<DynamicBubble[]>([]);

  useEffect(() => {
    setBubbles(Array.from({ length: 16 }, (_, i) => createDynamicBubble(i + 1, true)));
  }, []);

  const handleBubbleEnd = (bubbleId: number) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === bubbleId ? createDynamicBubble(bubbleId, false) : b))
    );
  };

  return (
    <>
      {bubbles.map((b) => (
        <div
          key={b.key}
          className={`${styles.bubble} ${b.isCenter ? styles.bubbleCenter : ''}`}
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: b.duration,
            animationDelay: b.delay,
            ['--bubble-dx' as any]: b.dx,
          }}
          onAnimationEnd={() => handleBubbleEnd(b.id)}
        />
      ))}
    </>
  );
};
