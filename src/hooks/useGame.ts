import { useCallback, useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import {
  BOARD_WIDTH,
  GAMEOVER_LINE_Y,
  GAMEOVER_THRESHOLD_MS,
  createEngine,
  createWalls,
  createFruitBody,
  getFruitBodies,
  clampDropX,
  type FruitBody,
} from '../game/physics';
import { type FruitLevel, getFruitDef, pickNextFruitLevel } from '../game/fruits';
import { renderFrame, preloadImages } from '../game/renderer';
import {
  spawnMergeEffect,
  registerMergeAnimation,
  updateParticles,
} from '../game/effects';
import { playPop, playDrop, playGameOver, setMuted, loadMuteSetting } from '../game/sound';
import { loadHighScore, saveHighScore } from '../game/gameState';

const COOLDOWN_MS = 500;

export interface GameAPI {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  score: number;
  highScore: number;
  nextLevel: FruitLevel;
  isGameOver: boolean;
  isPaused: boolean;
  isMuted: boolean;
  imagesLoaded: boolean;
  appearedLevels: Set<FruitLevel>;
  handlePointerMove: (x: number) => void;
  handleDrop: () => void;
  handleReset: () => void;
  togglePause: () => void;
  toggleMute: () => void;
}

export function useGame(scale: number): GameAPI {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [nextLevel, setNextLevel] = useState<FruitLevel>(() => pickNextFruitLevel());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMutedState] = useState(loadMuteSetting);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [appearedLevels, setAppearedLevels] = useState<Set<FruitLevel>>(() => new Set([1, 2, 3, 4, 5]));

  const dropXRef = useRef(BOARD_WIDTH / 2);
  const canDropRef = useRef(true);
  const isGameOverRef = useRef(false);
  const isPausedRef = useRef(false);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(loadHighScore());
  const nextLevelRef = useRef<FruitLevel>(nextLevel);
  const currentDropBodyRef = useRef<FruitBody | null>(null);
  const appearedLevelsRef = useRef<Set<FruitLevel>>(new Set([1, 2, 3, 4, 5]));

  // Sync refs
  useEffect(() => { nextLevelRef.current = nextLevel; }, [nextLevel]);

  function addScore(points: number) {
    scoreRef.current += points;
    setScore(scoreRef.current);
    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
      saveHighScore(scoreRef.current);
    }
  }

  function markAppeared(level: FruitLevel) {
    if (!appearedLevelsRef.current.has(level)) {
      const next = new Set(appearedLevelsRef.current);
      next.add(level);
      appearedLevelsRef.current = next;
      setAppearedLevels(next);
    }
  }

  const triggerGameOver = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    setIsGameOver(true);
    playGameOver();
  }, []);

  const initEngine = useCallback(() => {
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
    }
    const engine = createEngine();
    engineRef.current = engine;
    createWalls(engine);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA as FruitBody;
        const b = pair.bodyB as FruitBody;
        if (
          a.label === b.label &&
          a.label.startsWith('fruit-') &&
          !a.merged &&
          !b.merged
        ) {
          const level = a.fruitLevel;
          a.merged = true;
          b.merged = true;

          const mx = (a.position.x + b.position.x) / 2;
          const my = (a.position.y + b.position.y) / 2;

          setTimeout(() => {
            if (!engineRef.current) return;
            Matter.World.remove(engineRef.current.world, a);
            Matter.World.remove(engineRef.current.world, b);

            if (level === 11) {
              // スイカ同士: 消滅のみ、スコア加算なし
              spawnMergeEffect(mx, my, 11);
              playPop(11);
            } else {
              const newLevel = (level + 1) as FruitLevel;
              const newBody = createFruitBody(mx, my, newLevel);
              Matter.World.add(engineRef.current.world, newBody);
              registerMergeAnimation(newBody.id);
              spawnMergeEffect(mx, my, newLevel);
              playPop(level);
              addScore(getFruitDef(newLevel).scoreOnMerge);
              markAppeared(newLevel);
            }
          }, 0);
        }
      }
    });

    return engine;
  }, []);

  const dropFruit = useCallback(() => {
    if (!canDropRef.current || isGameOverRef.current || isPausedRef.current) return;
    if (!engineRef.current) return;

    const level = nextLevelRef.current;
    const x = clampDropX(dropXRef.current, level);
    const y = GAMEOVER_LINE_Y - 40;

    const body = createFruitBody(x, y, level, true);
    Matter.World.add(engineRef.current.world, body);
    currentDropBodyRef.current = body;
    markAppeared(level);

    playDrop();

    canDropRef.current = false;
    const newNext = pickNextFruitLevel();
    nextLevelRef.current = newNext;
    setNextLevel(newNext);
    markAppeared(newNext);

    setTimeout(() => {
      if (body) body.isDropping = false;
      currentDropBodyRef.current = null;
      canDropRef.current = true;
    }, COOLDOWN_MS);
  }, []);

  // Game loop
  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderCtx = ctx;
    const dpr = window.devicePixelRatio || 1;

    let lastTs = performance.now();

    function loop(ts: number) {
      rafRef.current = requestAnimationFrame(loop);
      if (isGameOverRef.current) return;
      if (isPausedRef.current) return;

      const dt = ts - lastTs;
      lastTs = ts;

      const engine = engineRef.current;
      if (!engine) return;

      Matter.Engine.update(engine, 1000 / 60);

      updateParticles(dt);

      // Gameover check
      const bodies = getFruitBodies(engine);
      const now = performance.now();
      for (const body of bodies) {
        if (body.isDropping) continue;
        if (body.merged) continue;

        const topY = body.position.y - getFruitDef(body.fruitLevel).radius;
        if (topY < GAMEOVER_LINE_Y) {
          if (body.overLineStartTime === null) {
            body.overLineStartTime = now;
          } else if (now - body.overLineStartTime > GAMEOVER_THRESHOLD_MS) {
            triggerGameOver();
            return;
          }
        } else {
          body.overLineStartTime = null;
        }
      }

      // Render
      renderFrame(renderCtx, bodies, dropXRef.current, canDropRef.current ? nextLevelRef.current : null, dpr * scale);
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [triggerGameOver, scale]);

  const handleReset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    isGameOverRef.current = false;
    isPausedRef.current = false;
    scoreRef.current = 0;
    canDropRef.current = true;
    currentDropBodyRef.current = null;
    dropXRef.current = BOARD_WIDTH / 2;
    const initialLevels = new Set<FruitLevel>([1, 2, 3, 4, 5]);
    appearedLevelsRef.current = initialLevels;
    setAppearedLevels(initialLevels);

    const newNext = pickNextFruitLevel();
    nextLevelRef.current = newNext;
    setNextLevel(newNext);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);

    initEngine();
    startLoop();
  }, [initEngine, startLoop]);

  const handlePointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = (clientX - rect.left) / scale;
    const level = nextLevelRef.current;
    dropXRef.current = clampDropX(relX, level);
  }, [scale]);

  const handleDrop = useCallback(() => {
    dropFruit();
  }, [dropFruit]);

  const togglePause = useCallback(() => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMutedState(next);
    setMuted(next);
  }, [isMuted]);

  // Init on mount
  useEffect(() => {
    preloadImages(() => setImagesLoaded(true));
    highScoreRef.current = loadHighScore();
    setHighScore(highScoreRef.current);
    initEngine();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start game loop once images are loaded and canvas is mounted
  useEffect(() => {
    if (!imagesLoaded) return;
    cancelAnimationFrame(rafRef.current);
    startLoop();
  }, [imagesLoaded, startLoop]);

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
      }
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleDrop();
      }
      if (e.key === 'ArrowLeft') {
        const level = nextLevelRef.current;
        const def = getFruitDef(level);
        dropXRef.current = clampDropX(dropXRef.current - 10, level);
        // Force re-render hint
        dropXRef.current = Math.max(def.radius, dropXRef.current);
      }
      if (e.key === 'ArrowRight') {
        const level = nextLevelRef.current;
        const def = getFruitDef(level);
        dropXRef.current = clampDropX(dropXRef.current + 10, level);
        dropXRef.current = Math.min(BOARD_WIDTH - def.radius, dropXRef.current);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDrop, togglePause]);

  return {
    canvasRef,
    score,
    highScore,
    nextLevel,
    isGameOver,
    isPaused,
    isMuted,
    imagesLoaded,
    appearedLevels,
    handlePointerMove,
    handleDrop,
    handleReset,
    togglePause,
    toggleMute,
  };
}
