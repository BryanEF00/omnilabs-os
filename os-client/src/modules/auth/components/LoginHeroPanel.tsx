import React, { useState, Suspense, lazy } from 'react';
import styles from './LoginHeroPanel.module.css';
import bubblesStyles from './LoginBubbles.module.css';
import wavesStyles from './LoginWaves.module.css';
import cellsStyles from './LoginCells.module.css';
import { AjinomotoLogo } from '@/components/brand/AjinomotoLogo';
import { LoginBubbles } from './LoginBubbles';
import { LoginWaves } from './LoginWaves';

const LoginCellsContainer = lazy(() =>
  import('./LoginCellsContainer').then((m) => ({ default: m.LoginCellsContainer }))
);

const THEME_STORAGE_KEY = 'omnilabs_hero_theme';

export type HeroAnimationMode = 'bubbles' | 'waves' | 'cells';

/**
 * Painel Hero da coluna esquerda da tela de autenticação Split-Screen.
 * Exibe a marca Ajinomoto e permite alternar entre as 3 animações biológicas.
 */
export const LoginHeroPanel: React.FC<{ className?: string }> = ({ className }) => {
  const [animMode, setAnimMode] = useState<HeroAnimationMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('lims_login_theme');
    if (saved === 'bubbles' || saved === 'waves' || saved === 'cells') return saved;
    return 'bubbles';
  });

  const handleSelectMode = (mode: HeroAnimationMode) => {
    setAnimMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const getModeClass = () => {
    switch (animMode) {
      case 'bubbles':
        return bubblesStyles.modeBubbles;
      case 'waves':
        return wavesStyles.modeWaves;
      case 'cells':
        return cellsStyles.modeCells;
      default:
        return bubblesStyles.modeBubbles;
    }
  };

  return (
    <div className={`${styles.heroPanel} ${getModeClass()} ${className || ''}`}>
      {/* Modo 1: Bubbles */}
      {animMode === 'bubbles' && <LoginBubbles />}

      {/* Modo 2: Waves */}
      {animMode === 'waves' && <LoginWaves />}

      {/* Modo 3: Cells */}
      {animMode === 'cells' && (
        <Suspense fallback={null}>
          <LoginCellsContainer />
        </Suspense>
      )}

      {/* Conteúdo Institucional Central */}
      <div className={styles.heroContent}>
        <AjinomotoLogo className={styles.heroLogo} />
        <h1 className={styles.heroTitle}>
          Laboratório de
          <br />
          Desenvolvimento II
        </h1>
      </div>

      {/* Rodapé & Seletor de Tema */}
      <div className={styles.heroFooterArea}>
        <div className={styles.themeSwitcher}>
          <button
            type="button"
            className={`${styles.themeBtn} ${animMode === 'bubbles' ? styles.active : ''}`}
            onClick={() => handleSelectMode('bubbles')}
          >
            Bubbles
          </button>
          <button
            type="button"
            className={`${styles.themeBtn} ${animMode === 'waves' ? styles.active : ''}`}
            onClick={() => handleSelectMode('waves')}
          >
            Waves
          </button>
          <button
            type="button"
            className={`${styles.themeBtn} ${animMode === 'cells' ? styles.active : ''}`}
            onClick={() => handleSelectMode('cells')}
          >
            Cells
          </button>
        </div>
        <div className={styles.heroFooter}>
          <span>OmniLabs OS • v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
