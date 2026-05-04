import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconDir = path.join(__dirname, '..', 'public', 'icons');

const sizes = [48, 72, 96, 144, 192, 512];

for (const size of sizes) {
  const r = Math.floor(size * 0.2);
  const fontSize = Math.floor(size * 0.35);
  const subSize = Math.floor(size * 0.15);
  const tinySize = Math.floor(size * 0.07);
  const m = Math.floor(size * 0.08);
  const ir = Math.floor(r * 0.8);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#10b981"/>
  <rect x="${m}" y="${m}" width="${size - m*2}" height="${size - m*2}" rx="${ir}" fill="#059669"/>
  <text x="50%" y="40%" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${fontSize}">A</text>
  <text x="50%" y="65%" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.85)" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="${subSize}">360</text>
  <line x1="${Math.floor(size*0.3)}" y1="${Math.floor(size*0.78)}" x2="${Math.floor(size*0.7)}" y2="${Math.floor(size*0.78)}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="50%" y="86%" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.5)" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="${tinySize}">SMART FARMING</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(iconDir, `icon-${size}x${size}.png`));
  console.log(`Created icon-${size}x${size}.png`);
}

console.log('All PNG icons generated!');
