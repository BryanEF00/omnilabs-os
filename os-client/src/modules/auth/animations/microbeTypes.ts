/**
 * Modelo de dados de um microrganismo na simulação microscópica.
 */
export interface Microbe {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  angle: number;
  targetAngle: number;
  length: number;
  radius: number;
  speed: number;
  swimPhase: number;
  tumbleTimer: number;
  mitosisProgress: number;
}
