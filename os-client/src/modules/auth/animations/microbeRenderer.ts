import { Microbe } from './microbeTypes';

/** Desenha uma cápsula arredondada centrada em (0,0) */
export const drawCapsule = (ctx: CanvasRenderingContext2D, len: number, r: number) => {
  const hb = Math.max(0, len / 2 - r);
  ctx.beginPath();
  ctx.arc(hb, 0, r, -Math.PI / 2, Math.PI / 2, false);
  ctx.arc(-hb, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  ctx.closePath();
};

/** Pinta a forma geométrica com preenchimento contínuo, brilho e contorno externo */
const paintGeometry = (
  ctx: CanvasRenderingContext2D,
  r: number,
  opacity: number,
  glowBlur: number,
  strokeAlpha: number
) => {
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = glowBlur;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.32})`;
  ctx.fill();

  ctx.shadowBlur = 0;
  const grad = ctx.createLinearGradient(0, -r, 0, r);
  grad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.92})`);
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.48})`);
  grad.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.88})`);
  ctx.fillStyle = grad;
  ctx.fill();

  if (strokeAlpha > 0.1) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  }
};

/** Desenha a união externa (sem linhas internas) de duas cápsulas deslizando */
const drawSlidingUnionPath = (ctx: CanvasRenderingContext2D, d: number, len: number, r: number) => {
  const hb = Math.max(0, len / 2 - r);
  const cCenter = d - hb;

  ctx.beginPath();
  if (cCenter <= 0) {
    // 1. Sobreposição total: cápsula contínua única
    ctx.arc(d + hb, 0, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.arc(-d - hb, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.closePath();
  } else {
    // 2. Sobreposição parcial com entalhe externo simétrico no ponto de encontro (x=0)
    const angle = Math.acos(Math.min(1, cCenter / r));

    ctx.arc(-d - hb, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.lineTo(-d + hb, -r);
    ctx.arc(-d + hb, 0, r, -Math.PI / 2, -angle, false);
    ctx.arc(d - hb, 0, r, -Math.PI + angle, -Math.PI / 2, false);
    ctx.lineTo(d + hb, -r);
    ctx.arc(d + hb, 0, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(d - hb, r);
    ctx.arc(d - hb, 0, r, Math.PI / 2, Math.PI - angle, false);
    ctx.arc(-d + hb, 0, r, angle, Math.PI / 2, false);
    ctx.lineTo(-d - hb, r);
    ctx.closePath();
  }
};

/** Renderiza a mitose por deslizamento simétrico */
const renderSlidingMitosis = (
  ctx: CanvasRenderingContext2D,
  m: Microbe,
  baseScale: number,
  opacity: number,
  glowBlur: number,
  strokeAlpha: number
) => {
  const len = m.length * baseScale;
  const r = m.radius * baseScale;
  const hb = Math.max(0, len / 2 - r);
  const maxSlide = hb + r + 3;

  const d = m.mitosisProgress * maxSlide;

  if (d < hb + r) {
    drawSlidingUnionPath(ctx, d, len, r);
    paintGeometry(ctx, r, opacity, glowBlur, strokeAlpha);
  } else {
    ctx.save();
    ctx.translate(-d, 0);
    drawCapsule(ctx, len, r);
    paintGeometry(ctx, r, opacity, glowBlur, strokeAlpha);
    ctx.restore();

    ctx.save();
    ctx.translate(d, 0);
    drawCapsule(ctx, len, r);
    paintGeometry(ctx, r, opacity, glowBlur, strokeAlpha);
    ctx.restore();
  }
};

/** Renderiza o bacilo em nado normal ou em mitose deslizante */
export const renderMicrobe = (ctx: CanvasRenderingContext2D, m: Microbe) => {
  const baseScale = 0.70 + m.z * 0.50;
  const isForeground = m.z > 0.75;
  const opacity = isForeground ? 0.88 : m.z >= 0.4 ? 0.52 : 0.22;
  const glowBlur = isForeground ? 5.5 : m.z >= 0.4 ? 3.5 : 1.5;
  const strokeAlpha = isForeground ? 0.85 : 0;

  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.angle);

  if (m.mitosisProgress === 0) {
    const len = m.length * baseScale;
    const r = m.radius * baseScale;
    drawCapsule(ctx, len, r);
    paintGeometry(ctx, r, opacity, glowBlur, strokeAlpha);
  } else {
    renderSlidingMitosis(ctx, m, baseScale, opacity, glowBlur, strokeAlpha);
  }

  ctx.restore();
};
