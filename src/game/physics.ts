import Matter from 'matter-js';
import { type FruitLevel, getFruitDef } from './fruits';

export const BOARD_WIDTH = 400;
export const BOARD_HEIGHT = 600;
export const GAMEOVER_LINE_Y = 80;
export const DROP_LINE_Y = GAMEOVER_LINE_Y - 40;
export const GAMEOVER_THRESHOLD_MS = 2000;

export interface FruitBody extends Matter.Body {
  fruitLevel: FruitLevel;
  merged: boolean;
  isDropping: boolean;
  overLineStartTime: number | null;
}

export function createEngine(): Matter.Engine {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.0018 }, // stronger gravity for realistic heavy-fruit feel
    positionIterations: 10,  // default 6 — more accurate collision resolution
    velocityIterations: 8,   // default 4 — more accurate velocity response
  });
  return engine;
}

export function createWalls(engine: Matter.Engine): void {
  const w = BOARD_WIDTH;
  const h = BOARD_HEIGHT;
  const wallOpts = { isStatic: true, friction: 0.6, restitution: 0.05 };
  const walls = [
    Matter.Bodies.rectangle(w / 2, h + 25, w, 50, { ...wallOpts, label: 'wall-bottom' }),
    Matter.Bodies.rectangle(-25, h / 2, 50, h, { ...wallOpts, label: 'wall-left' }),
    Matter.Bodies.rectangle(w + 25, h / 2, 50, h, { ...wallOpts, label: 'wall-right' }),
  ];
  Matter.World.add(engine.world, walls);
}

export function createFruitBody(
  x: number,
  y: number,
  level: FruitLevel,
  isDropping = false
): FruitBody {
  const def = getFruitDef(level);
  const body = Matter.Bodies.circle(x, y, def.radius, {
    restitution: 0.05,    // almost no bounce — fruit is soft and heavy
    friction: 0.6,        // high friction — fruits grip each other and walls
    frictionStatic: 0.8,  // high static friction — stacks stay stable
    frictionAir: 0.005,   // slight air resistance to dampen jitter
    density: 0.002,       // uniform density (larger = heavier, natural feel)
    label: `fruit-${level}`,
  }) as FruitBody;

  body.fruitLevel = level;
  body.merged = false;
  body.isDropping = isDropping;
  body.overLineStartTime = null;

  return body;
}

export function getFruitBodies(engine: Matter.Engine): FruitBody[] {
  return engine.world.bodies.filter(
    (b) => b.label.startsWith('fruit-')
  ) as FruitBody[];
}

export function clampDropX(x: number, level: FruitLevel): number {
  const def = getFruitDef(level);
  return Math.max(def.radius, Math.min(BOARD_WIDTH - def.radius, x));
}
