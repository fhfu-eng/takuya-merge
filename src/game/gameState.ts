import { type FruitLevel, pickNextFruitLevel } from './fruits';

export interface GameState {
  score: number;
  highScore: number;
  nextLevel: FruitLevel;
  isGameOver: boolean;
  isPaused: boolean;
  appearedLevels: Set<FruitLevel>;
}

const HIGH_SCORE_KEY = 'suika-game-highscore';

export function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch { /* ignore */ }
}

export function createInitialState(): GameState {
  return {
    score: 0,
    highScore: loadHighScore(),
    nextLevel: pickNextFruitLevel(),
    isGameOver: false,
    isPaused: false,
    appearedLevels: new Set<FruitLevel>([1]),
  };
}
