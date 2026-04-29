import { useRef, useEffect, useCallback } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/physics';
import { unlockAudio } from '../game/sound';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale: number;
  onPointerMove: (x: number) => void;
  onDrop: () => void;
}

export function GameCanvas({ canvasRef, scale, onPointerMove, onDrop }: Props) {
  const displayW = BOARD_WIDTH * scale;
  const displayH = BOARD_HEIGHT * scale;
  const dpr = window.devicePixelRatio || 1;
  const isDraggingRef = useRef(false);
  const onPointerMoveRef = useRef(onPointerMove);
  const onDropRef = useRef(onDrop);
  onPointerMoveRef.current = onPointerMove;
  onDropRef.current = onDrop;

  // Mouse events (desktop)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    onPointerMove(e.clientX);
  }, [onPointerMove]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onPointerMove(e.clientX);
    onDrop();
  }, [onPointerMove, onDrop]);

  // Native touch listeners (non-passive so preventDefault works on iOS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      unlockAudio();
      isDraggingRef.current = true;
      onPointerMoveRef.current(e.touches[0].clientX);
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (isDraggingRef.current) {
        onPointerMoveRef.current(e.touches[0].clientX);
      }
    }

    function onTouchEnd(e: TouchEvent) {
      e.preventDefault();
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (e.changedTouches.length > 0) {
          onPointerMoveRef.current(e.changedTouches[0].clientX);
        }
        onDropRef.current();
      }
    }

    // { passive: false } is required to allow preventDefault on iOS Safari
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, [canvasRef]);

  // Canvas physical size (HiDPI)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = BOARD_WIDTH  * dpr * scale;
    canvas.height = BOARD_HEIGHT * dpr * scale;
  }, [canvasRef, scale, dpr]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: displayW,
        height: displayH,
        cursor: 'crosshair',
        display: 'block',
        touchAction: 'none',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}
