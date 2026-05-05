const c = require('fs').readFileSync('src/pages/PaymentPage.jsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('\uFFFD')) {
    // Show context around each replacement char
    const idx = l.indexOf('\uFFFD');
    const start = Math.max(0, idx - 5);
    const end = Math.min(l.length, idx + 20);
    const snippet = l.substring(start, end);
    const codes = [];
    for (let j = Math.max(0, idx - 2); j < Math.min(l.length, idx + 10); j++) {
      codes.push('U+' + l.charCodeAt(j).toString(16).padStart(4, '0'));
    }
    console.log(`Line ${i + 1}: ...${snippet}...`);
    console.log(`  Codes: ${codes.join(' ')}`);
  }
});
