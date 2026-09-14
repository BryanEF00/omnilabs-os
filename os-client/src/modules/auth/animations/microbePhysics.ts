import { Microbe } from './microbeTypes';

let nextMicrobeId = 100;

/** Cria um bacilo com características físicas e biológicas de bioprocesso */
export const createMicrobe = (width: number, height: number, customZ?: number): Microbe => {
  const z = customZ !== undefined ? customZ : (Math.random() < 0.4 ? 0.22 : Math.random() < 0.75 ? 0.55 : 0.88);
  const baseLen = 14 + Math.random() * 6;
  const speed = (0.06 + Math.random() * 0.08) * (0.6 + z * 0.5);
  const angle = Math.random() * Math.PI * 2;

  return {
    id: nextMicrobeId++,
    x: Math.random() * width,
    y: Math.random() * height,
    z,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle,
    targetAngle: angle,
    length: baseLen,
    radius: baseLen * 0.22,
    speed,
    swimPhase: Math.random() * Math.PI * 2,
    tumbleTimer: Math.random() * 450 + 250,
    mitosisProgress: 0,
  };
};

/** Processa a fissão celular com vetor de direção orgânico para as células-filhas */
const splitMicrobe = (m: Microbe, w: number, h: number): Microbe[] => {
  const baseScale = 0.70 + m.z * 0.50;
  const len = m.length * baseScale;
  const r = m.radius * baseScale;
  const hb = Math.max(0, len / 2 - r);
  const centerDist = hb + r + 3;

  const speed1 = (0.06 + Math.random() * 0.08) * (0.6 + m.z * 0.5);
  const speed2 = (0.06 + Math.random() * 0.08) * (0.6 + m.z * 0.5);

  const coneSpread = 1.30;
  const spread1 = (Math.random() * 2 - 1) * coneSpread;
  const spread2 = (Math.random() * 2 - 1) * coneSpread;

  // Célula 1: ponta frontal
  const target1 = (m.angle + spread1) % (Math.PI * 2);
  const child1: Microbe = {
    ...createMicrobe(w, h, m.z),
    length: m.length,
    radius: m.radius,
    x: m.x + Math.cos(m.angle) * centerDist,
    y: m.y + Math.sin(m.angle) * centerDist,
    angle: m.angle,
    targetAngle: target1,
    vx: Math.cos(m.angle) * speed1,
    vy: Math.sin(m.angle) * speed1,
    tumbleTimer: Math.random() * 350 + 250,
    mitosisProgress: 0,
  };

  // Célula 2: ponta traseira oposta
  const initialAngle2 = (m.angle + Math.PI) % (Math.PI * 2);
  const target2 = (m.angle + Math.PI + spread2) % (Math.PI * 2);
  const child2: Microbe = {
    ...createMicrobe(w, h, m.z),
    length: m.length,
    radius: m.radius,
    x: m.x - Math.cos(m.angle) * centerDist,
    y: m.y - Math.sin(m.angle) * centerDist,
    angle: initialAngle2,
    targetAngle: target2,
    vx: Math.cos(initialAngle2) * speed2,
    vy: Math.sin(initialAngle2) * speed2,
    tumbleTimer: Math.random() * 350 + 250,
    mitosisProgress: 0,
  };

  return [child1, child2];
};

/** Atualiza o progresso da mitose e retorna as células filhas caso concluída */
const updateMitosis = (m: Microbe, w: number, h: number, dt: number): Microbe[] | null => {
  if (m.mitosisProgress <= 0) return null;
  m.mitosisProgress += 0.0028 * dt;
  return m.mitosisProgress >= 1.0 ? splitMicrobe(m, w, h) : null;
};

/** Atualiza rotação, direção e temporizador de tombamento estocástico */
const updateOrientation = (m: Microbe, isDividing: boolean, dt: number) => {
  m.tumbleTimer -= dt;
  if (!isDividing && m.tumbleTimer <= 0) {
    m.targetAngle += (Math.random() * 1.1 - 0.55);
    m.speed = (0.05 + Math.random() * 0.08) * (0.6 + m.z * 0.5);
    m.tumbleTimer = Math.random() * 500 + 300;
  }
  const diff = Math.atan2(Math.sin(m.targetAngle - m.angle), Math.cos(m.targetAngle - m.angle));
  m.angle += diff * (isDividing ? 0.004 : 0.014) * dt;
};

/** Atualiza oscilação de nado, propulsão, velocidade e limites de tela */
const updatePosition = (m: Microbe, isDividing: boolean, w: number, h: number, dt: number) => {
  m.swimPhase += (isDividing ? 0.006 : 0.018) * dt;
  const currentSpeed = isDividing ? m.speed * 0.12 : m.speed;
  const thrust = currentSpeed * (1 + Math.sin(m.swimPhase) * 0.16);

  m.vx = Math.cos(m.angle) * thrust + (Math.random() - 0.5) * (isDividing ? 0.01 : 0.02);
  m.vy = Math.sin(m.angle) * thrust + (Math.random() - 0.5) * (isDividing ? 0.01 : 0.02);

  m.x += m.vx * dt;
  m.y += m.vy * dt;

  if (m.x < -30) m.x = w + 25;
  if (m.x > w + 30) m.x = -25;
  if (m.y < -30) m.y = h + 25;
  if (m.y > h + 30) m.y = -25;
};

/** Atualiza cinemática e processa o ciclo de mitose com Delta-Time */
export const updateMicrobePhysics = (m: Microbe, w: number, h: number, dt: number = 1.0): Microbe[] => {
  const splitResult = updateMitosis(m, w, h, dt);
  if (splitResult) return splitResult;

  const isDividing = m.mitosisProgress > 0;
  updateOrientation(isDividing ? m : m, isDividing, dt);
  updatePosition(m, isDividing, w, h, dt);

  return [m];
};
