import { type FruitBody, BOARD_WIDTH, BOARD_HEIGHT, GAMEOVER_LINE_Y } from './physics';
import { getFruitDef, type FruitLevel } from './fruits';
import { getMergeScale, drawParticles } from './effects';

const imageCache = new Map<number, HTMLImageElement | null>();

export function preloadImages(onComplete: () => void): void {
  let loaded = 0;
  const total = 11;

  for (let i = 1; i <= 11; i++) {
    const def = getFruitDef(i as FruitLevel);
    const img = new Image();
    img.onload = () => {
      imageCache.set(i, img);
      loaded++;
      if (loaded === total) onComplete();
    };
    img.onerror = () => {
      imageCache.set(i, null);
      loaded++;
      if (loaded === total) onComplete();
    };
    img.src = def.imagePath;
  }
}

function drawFruit(
  ctx: CanvasRenderingContext2D,
  body: FruitBody,
  alpha = 1,
  scaleOverride?: number
): void {
  const def = getFruitDef(body.fruitLevel);
  const { x, y } = body.position;
  const angle = body.angle;
  const scale = scaleOverride ?? getMergeScale(body.id);
  const r = def.radius * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;

  const img = imageCache.get(body.fruitLevel);
  if (img) {
    // Clip to physics circle, then draw image with:
    //   - scale so that content 95th-pct radius fills the physics radius
    //   - offset so that content centroid aligns with physics body center (not image center)
    //   drawHalf = r * imageScale
    //   topLeft  = -drawHalf * (1 + centOffset)  ← derived from centroid alignment math
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    const dr = r * def.imageScale;
    ctx.drawImage(
      img,
      -dr * (1 + def.imageCentX),
      -dr * (1 + def.imageCentY),
      dr * 2,
      dr * 2,
    );
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(8, r * 0.4)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.name, 0, 0);
  }

  ctx.restore();
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  bodies: FruitBody[],
  previewX: number,
  previewLevel: FruitLevel | null,
  dpr: number
): void {
  ctx.clearRect(0, 0, BOARD_WIDTH * dpr, BOARD_HEIGHT * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // Gameover line — gold dashed
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(212,175,55,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GAMEOVER_LINE_Y);
  ctx.lineTo(BOARD_WIDTH, GAMEOVER_LINE_Y);
  ctx.stroke();
  ctx.restore();

  // Fruits
  for (const body of bodies) {
    if (!body.merged) {
      drawFruit(ctx, body);
    }
  }

  // Particles
  drawParticles(ctx);

  // Drop preview
  if (previewLevel !== null) {
    const def = getFruitDef(previewLevel);
    const previewBody = {
      fruitLevel: previewLevel,
      position: { x: previewX, y: GAMEOVER_LINE_Y - 40 },
      angle: 0,
      id: -1,
      merged: false,
    } as unknown as FruitBody;
    drawFruit(ctx, previewBody, 0.6, 1);

    // Drop guide line
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(previewX, GAMEOVER_LINE_Y - 40 + def.radius);
    ctx.lineTo(previewX, BOARD_HEIGHT);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
