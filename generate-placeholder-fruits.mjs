/**
 * Node.js script to generate placeholder fruit images using canvas.
 * Run: node generate-placeholder-fruits.mjs
 * Requires: npm install canvas
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fruits = [
  { level: 1,  name: 'さくらんぼ', radius: 20,  color: '#e63946', emoji: '🍒' },
  { level: 2,  name: 'いちご',     radius: 25,  color: '#ff6b6b', emoji: '🍓' },
  { level: 3,  name: 'ぶどう',     radius: 32,  color: '#9b5de5', emoji: '🍇' },
  { level: 4,  name: 'デコポン',   radius: 40,  color: '#ffa94d', emoji: '🍊' },
  { level: 5,  name: 'かき',       radius: 50,  color: '#ff8c42', emoji: '🫒' },
  { level: 6,  name: 'りんご',     radius: 62,  color: '#e63946', emoji: '🍎' },
  { level: 7,  name: 'なし',       radius: 75,  color: '#dde5b6', emoji: '🍐' },
  { level: 8,  name: 'もも',       radius: 90,  color: '#ffafcc', emoji: '🍑' },
  { level: 9,  name: 'パイナップル', radius: 105, color: '#ffd60a', emoji: '🍍' },
  { level: 10, name: 'メロン',     radius: 120, color: '#80b918', emoji: '🍈' },
  { level: 11, name: 'スイカ',     radius: 140, color: '#2d6a4f', emoji: '🍉' },
];

const SIZE = 300;
const outputDir = path.join(__dirname, 'public', 'fruits');

for (const fruit of fruits) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = fruit.color;
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Emoji
  ctx.font = `${SIZE * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fruit.emoji, SIZE / 2, SIZE / 2 + 4);

  // Level badge
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.arc(SIZE * 0.82, SIZE * 0.18, SIZE * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${SIZE * 0.13}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(fruit.level), SIZE * 0.82, SIZE * 0.18);

  const fileName = `${String(fruit.level).padStart(2, '0')}_${['cherry','strawberry','grape','dekopon','persimmon','apple','pear','peach','pineapple','melon','watermelon'][fruit.level - 1]}.png`;
  const outputPath = path.join(outputDir, fileName);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${fileName}`);
}

console.log('Done!');
