import React, { useState, useEffect } from 'react';
import styles from './LoginWaves.module.css';

interface DynamicGlassTeardrop {
  id: number;
  left: string;
  width: string;
  height: string;
  duration: string;
  delay: string;
  dx: string;
  key: number;
}

/** Gerador de gotas cristalinas em escorrimento */
const createGlassTeardrop = (id: number, initialDelay = '0s'): DynamicGlassTeardrop => {
  const zone = id % 3;
  let minX = 12;
  if (zone === 1) minX = 38;
  if (zone === 2) minX = 64;

  const rawLeft = Math.floor(Math.random() * 22) + minX;
  const size = (Math.random() * 3.4 + 2.8).toFixed(1);
  const heightSize = (parseFloat(size) * 1.35).toFixed(1);
  const rawDx = (Math.random() * 24 - 12).toFixed(0);
  const duration = (Math.random() * 0.6 + 2.8).toFixed(1);

  return {
    id,
    left: `${rawLeft}%`,
    width: `${size}px`,
    height: `${heightSize}px`,
    duration: `${duration}s`,
    delay: initialDelay,
    dx: `${rawDx}px`,
    key: Date.now() + Math.random(),
  };
};

/** Componente da animação de Ondas de Fermentação e Gotas em Vidro */
export const LoginWaves: React.FC = () => {
  const [glassDrops, setGlassDrops] = useState<DynamicGlassTeardrop[]>([]);

  useEffect(() => {
    setGlassDrops([
      createGlassTeardrop(1, '1.5s'),
      createGlassTeardrop(2, '5.5s'),
      createGlassTeardrop(3, '10.5s'),
    ]);
  }, []);

  const handleDropEnd = (dropId: number) => {
    setGlassDrops((prev) =>
      prev.map((d) =>
        d.id === dropId
          ? createGlassTeardrop(dropId, `${(Math.random() * 7.0 + 5.0).toFixed(1)}s`)
          : d
      )
    );
  };

  return (
    <div className={styles.waveContainer}>
      <svg className={styles.defsHidden} aria-hidden="true">
        <defs>
          <linearGradient id="waveMilkGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
            <stop offset="14%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#a81313" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="waveMilkGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="18%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="85%" stopColor="#a81313" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="waveMilkGrad3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#a81313" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      <div className={styles.waveAmplitudeWrapper}>
        <div className={`${styles.waveLayer} ${styles.waveLayer3}`}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,38 C175,56 425,18 600,38 C775,56 1025,18 1200,38 L1200,120 L0,120 Z"
              fill="url(#waveMilkGrad3)"
            />
          </svg>
        </div>

        <div className={`${styles.waveLayer} ${styles.waveLayer2}`}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,42 C175,15 425,62 600,42 C775,15 1025,62 1200,42 L1200,120 L0,120 Z"
              fill="url(#waveMilkGrad2)"
            />
          </svg>
        </div>

        {glassDrops.map((drop) => (
          <div
            key={drop.key}
            className={styles.splashDropletFront}
            style={{
              left: drop.left,
              width: drop.width,
              height: drop.height,
              animationDuration: drop.duration,
              animationDelay: drop.delay,
              ['--splash-dx' as any]: drop.dx,
            }}
            onAnimationEnd={() => handleDropEnd(drop.id)}
          />
        ))}

        <div className={`${styles.waveLayer} ${styles.waveLayer1}`}>
          <div className={styles.snakeWaveWrapper}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,35 C175,65 425,10 600,35 C775,65 1025,10 1200,35 L1200,120 L0,120 Z"
                fill="url(#waveMilkGrad1)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
