import { getFruitDef, type FruitLevel } from './fruits';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

export interface MergeAnimation {
  bodyId: number;
  startTime: number;
  duration: number;
}

const particles: Particle[] = [];
const mergeAnimations: Map<number, MergeAnimation> = new Map();

export function spawnMergeEffect(x: number, y: number, level: FruitLevel): void {
  const def = getFruitDef(level);
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 1.5 + Math.random() * 2.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      color: def.color,
      life: 1,
      size: 4 + Math.random() * 4,
    });
  }
}

export function registerMergeAnimation(bodyId: number): void {
  mergeAnimations.set(bodyId, {
    bodyId,
    startTime: performance.now(),
    duration: 200,
  });
}

export function getMergeScale(bodyId: number): number {
  const anim = mergeAnimations.get(bodyId);
  if (!anim) return 1;
  const elapsed = performance.now() - anim.startTime;
  const t = elapsed / anim.duration;
  if (t >= 1) {
    mergeAnimations.delete(bodyId);
    return 1;
  }
  if (t < 0.4) {
    return 0.5 + t / 0.4 * 0.7;
  }
  if (t < 0.7) {
    return 1.2 - ((t - 0.4) / 0.3) * 0.2;
  }
  return 1.0;
}

export function updateParticles(dt: number): void {
  const gravity = 0.08;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += gravity;
    p.life -= dt / 500;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
