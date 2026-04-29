export type FruitLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface FruitDef {
  level: FruitLevel;
  name: string;
  nameEn: string;
  radius: number;
  color: string;
  scoreOnMerge: number;
  imagePath: string;
  // Drawing correction: scale image so 95th-pct content radius fills physics circle,
  // centered on content centroid (not image center).
  // imageScale = (imgHalfWidth) / r95  (capped at min 1.0)
  // imageCentX/Y = (centroid - imageCenter) / imgHalfWidth  (normalized offset)
  imageScale: number;
  imageCentX: number;
  imageCentY: number;
}

// Values computed from actual PNG content analysis (300x300 images, imgHalfWidth=150)
export const FRUITS: FruitDef[] = [
  { level: 1,  name: 'センチメンタルタクヤ', nameEn: 'cherry',     radius: 20,  color: '#e63946', scoreOnMerge: 0,  imagePath: '/fruits/01_cherry.png',     imageScale: 1.200, imageCentX:  0.015, imageCentY:  0.007 },
  { level: 2,  name: '就活タクヤ',           nameEn: 'strawberry', radius: 25,  color: '#ff6b6b', scoreOnMerge: 1,  imagePath: '/fruits/02_strawberry.png', imageScale: 1.000, imageCentX: -0.052, imageCentY:  0.164 },
  { level: 3,  name: '自己啓発覚醒タクヤ',   nameEn: 'grape',      radius: 32,  color: '#9b5de5', scoreOnMerge: 3,  imagePath: '/fruits/03_grape.png',      imageScale: 1.000, imageCentX: -0.047, imageCentY: -0.011 },
  { level: 4,  name: '黒歴史タクヤ',         nameEn: 'dekopon',    radius: 40,  color: '#ffa94d', scoreOnMerge: 6,  imagePath: '/fruits/04_dekopon.png',    imageScale: 1.854, imageCentX:  0.036, imageCentY: -0.197 },
  { level: 5,  name: '電波遮断タクヤ',       nameEn: 'persimmon',  radius: 50,  color: '#ff8c42', scoreOnMerge: 10, imagePath: '/fruits/05_persimmon.png',  imageScale: 1.485, imageCentX:  0.050, imageCentY: -0.310 },
  { level: 6,  name: '無敵モード宣言タクヤ', nameEn: 'apple',      radius: 62,  color: '#e63946', scoreOnMerge: 15, imagePath: '/fruits/06_apple.png',      imageScale: 1.125, imageCentX: -0.065, imageCentY:  0.137 },
  { level: 7,  name: 'ご機嫌タクヤ',         nameEn: 'pear',       radius: 75,  color: '#dde5b6', scoreOnMerge: 21, imagePath: '/fruits/07_pear.png',       imageScale: 1.407, imageCentX:  0.013, imageCentY: -0.176 },
  { level: 8,  name: '金髪パリピタクヤ',     nameEn: 'peach',      radius: 90,  color: '#ffafcc', scoreOnMerge: 28, imagePath: '/fruits/08_peach.png',      imageScale: 1.218, imageCentX:  0.031, imageCentY: -0.216 },
  { level: 9,  name: '闇落ちタクヤ',         nameEn: 'pineapple',  radius: 105, color: '#ffd60a', scoreOnMerge: 36, imagePath: '/fruits/09_pineapple.png',  imageScale: 1.308, imageCentX:  0.061, imageCentY:  0.329 },
  { level: 10, name: 'クールタクヤ',         nameEn: 'melon',      radius: 120, color: '#80b918', scoreOnMerge: 45, imagePath: '/fruits/10_melon.png',      imageScale: 1.337, imageCentX: -0.130, imageCentY: -0.015 },
  { level: 11, name: '最終形態タクヤ', nameEn: 'watermelon', radius: 140, color: '#2d6a4f', scoreOnMerge: 55, imagePath: '/fruits/11_watermelon.png', imageScale: 1.020, imageCentX: -0.109, imageCentY:  0.159 },
];

export function getFruitDef(level: FruitLevel): FruitDef {
  return FRUITS[level - 1];
}

export function pickNextFruitLevel(): FruitLevel {
  const candidates: FruitLevel[] = [1, 2, 3, 4, 5];
  return candidates[Math.floor(Math.random() * candidates.length)];
}
