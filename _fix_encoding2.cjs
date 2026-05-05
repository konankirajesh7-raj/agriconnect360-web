const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') 
      results = results.concat(walk(fp));
    else if (/\.(jsx?|tsx?)$/.test(file)) results.push(fp);
  }
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalFixed = 0;

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;
  
  // Pattern: \uFFFD followed by specific bytes
  // \uFFFDx\u001c\uFFFD = 📱 (mobile/phone)
  c = c.replace(/\uFFFDx\u001c\uFFFD/g, '📱');
  // \uFFFDx\u001c9 = 📋
  c = c.replace(/\uFFFDx\u001c9/g, '📋');
  // \uFFFD \uFFFD = ← (back arrow)  
  c = c.replace(/\uFFFD \uFFFD/g, '⬅');
  // \uFFFDx\u0018\uFFFD⬍ = 👨‍🌾 (farmer with hat)
  c = c.replace(/\uFFFDx\u0018\uFFFD\u2B0D/g, '👨‍');
  // Any remaining single \uFFFD
  c = c.replace(/\uFFFD/g, '');
  
  if (c !== orig) {
    fs.writeFileSync(file, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

console.log(`\nRound 2 - Total files fixed: ${totalFixed}`);
