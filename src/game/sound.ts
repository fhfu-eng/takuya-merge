import { type FruitLevel } from './fruits';

let muted = false;
let audioUnlocked = false;

// iOS Safari requires audio to be triggered from a direct user gesture.
// We pre-create and immediately play/pause a silent buffer on first touch to unlock.
export function unlockAudio(): void {
  if (audioUnlocked) return;
  audioUnlocked = true;
  const silent = new Audio('/sounds/koukaon.mp3');
  silent.volume = 0;
  silent.play().then(() => silent.pause()).catch(() => {});
}

function play(path: string, rate = 1): void {
  if (muted) return;
  try {
    const audio = new Audio(path);
    audio.playbackRate = rate;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem('suika-game-mute', String(value));
  } catch { /* ignore */ }
}

export function loadMuteSetting(): boolean {
  try {
    return localStorage.getItem('suika-game-mute') === 'true';
  } catch {
    return false;
  }
}

export function playPop(level: FruitLevel): void {
  play('/sounds/koukaon.mp3', 0.7 + level * 0.05);
}

export function playDrop(): void {
  play('/sounds/drop.mp3');
}

export function playGameOver(): void {
  play('/sounds/gameover.mp3');
}

export { muted };
