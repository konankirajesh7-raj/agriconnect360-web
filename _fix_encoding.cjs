const fs = require('fs');
const path = require('path');

// Find all JSX/JS files in src/
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) results = results.concat(walk(fp));
    else if (/\.(jsx?|tsx?)$/.test(file)) results.push(fp);
  }
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalFixed = 0;

// Map of broken byte sequences to correct emojis
const replacements = [
  // Multi-char mojibake patterns (order matters - longest first)
  [/\uFFFD\u001d\uFFFD\u001d\uFFFD\u001d\uFFFD/g, ''],  // decorative separator
  [/\uFFFDx\}0/g, '🟢'],
  [/\uFFFDx\}x\uFE0F/g, '🎟️'],
  [/\uFFFDx\}x/g, '🎟'],
  [/\uFFFDS\u001c/g, '✅'],
  [/\uFFFDS\"/g, '✕'],
  [/\uFFFDS&/g, '✅'],
  [/\uFFFDa\uFFFD\uFE0F/g, '⚠️'],
  [/\uFFFDa\uFFFD/g, '⚠'],
  [/\uFFFDR /g, '❌ '],
  [/\uFFFDR/g, '❌'],
  [/\uFFFD\u001a\uFFFD/g, '₹'],
  [/\uFFFDx\u0019\uFFFD/g, '💳'],
  [/\uFFFDx\u001c~/g, '📞'],
  [/\uFFFDx\u0018\u0018/g, '🎁'],
  [/\uFFFDxR\uFFFD/g, '🌾'],
  [/\uFFFDx\uFFFD\uFFFD/g, '👤'],
  [/\uFFFD \u0019/g, '→'],
  [/\uFFFD\u001d /g, '—'],
  [/\uFFFD\u001d\uFFFD/g, ''],  // empty decoration
  // Single replacement characters
  [/\uFFFD{2,}/g, ''],  // multiple consecutive replacements
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [pattern, replacement] of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);
