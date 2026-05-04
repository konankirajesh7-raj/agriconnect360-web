const fs = require('fs');
const path = require('path');

const sizes = [48, 72, 96, 144, 192, 512];
const iconDir = path.join(__dirname, '..', 'public', 'icons');

sizes.forEach(size => {
  const r = Math.floor(size * 0.2);
  const fontSize = Math.floor(size * 0.35);
  const subSize = Math.floor(size * 0.15);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="${size}" height="${size}" rx="${r}" fill="#10b981"/>`,
    `<rect x="${Math.floor(size*0.08)}" y="${Math.floor(size*0.08)}" width="${Math.floor(size*0.84)}" height="${Math.floor(size*0.84)}" rx="${Math.floor(r*0.8)}" fill="#059669"/>`,
    `<text x="50%" y="42%" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial,sans-serif" font-weight="bold" font-size="${fontSize}">A</text>`,
    `<text x="50%" y="72%" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.8)" font-family="Arial,sans-serif" font-weight="600" font-size="${subSize}">360</text>`,
    `</svg>`
  ].join('\n');
  
  fs.writeFileSync(path.join(iconDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('All icons created!');
