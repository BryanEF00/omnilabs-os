import React, { useEffect, useRef } from 'react';
import styles from './LoginCells.module.css';
import { Microbe } from '../animations/microbeTypes';
import { createMicrobe, updateMicrobePhysics } from '../animations/microbePhysics';
import { renderMicrobe } from '../animations/microbeRenderer';

/**
 * Componente Canvas 2D de Microscopia com Ilusão de Óptica da Mitose
 * Equipado com 24/7 Sleep Guard para suspender renderização quando a aba estiver oculta.
 */
export const LoginCellsContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let dpr = window.devicePixelRatio || 1;
    let w = canvas.parentElement?.clientWidth || 240;
    let h = canvas.parentElement?.clientHeight || 480;

    const setupCanvas = () => {
      if (!canvas.parentElement) return;
      w = canvas.parentElement.clientWidth;
      h = canvas.parentElement.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupCanvas();
    const depthDistribution = [0.18, 0.20, 0.22, 0.22, 0.24, 0.25, 0.25, 0.26, 0.50, 0.55, 0.55, 0.58, 0.60, 0.85, 0.88];
    let microbes: Microbe[] = depthDistribution.map((z) => createMicrobe(w, h, z));

    let mitosisTimeout: number | undefined;

    const scheduleNextMitosis = () => {
      if (document.hidden) return;
      const delay = Math.random() * 7000 + 8000;
      mitosisTimeout = window.setTimeout(() => {
        if (document.hidden) return;
        if (microbes.length >= 18) {
          microbes = microbes.filter((_, idx) => idx !== 0);
        }
        const eligible = microbes.filter((m) => m.mitosisProgress === 0);
        if (eligible.length > 0) {
          const target = eligible[Math.floor(Math.random() * eligible.length)];
          target.mitosisProgress = 0.001;
        }
        scheduleNextMitosis();
      }, delay);
    };

    scheduleNextMitosis();

    const resizeObserver = new ResizeObserver(setupCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let lastTime: number | null = null;

    const loop = (currentTime: number) => {
      if (document.hidden) return;

      if (lastTime === null) lastTime = currentTime;
      const deltaMs = currentTime - lastTime;
      lastTime = currentTime;

      const dt = Math.min(Math.max(deltaMs / (1000 / 60), 0.05), 3.0);

      ctx.clearRect(0, 0, w, h);
      microbes.sort((a, b) => a.z - b.z);

      const nextMicrobes: Microbe[] = [];
      for (const m of microbes) {
        const updated = updateMicrobePhysics(m, w, h, dt);
        nextMicrobes.push(...updated);
        renderMicrobe(ctx, m);
      }
      microbes = nextMicrobes;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // 24/7 Sleep Guard
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        if (mitosisTimeout) {
          window.clearTimeout(mitosisTimeout);
          mitosisTimeout = undefined;
        }
        lastTime = null;
      } else {
        lastTime = null;
        animId = requestAnimationFrame(loop);
        scheduleNextMitosis();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mitosisTimeout) window.clearTimeout(mitosisTimeout);
      if (animId !== null) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.cellContainer}>
      <canvas ref={canvasRef} className={styles.cellCanvas} />
    </div>
  );
};
