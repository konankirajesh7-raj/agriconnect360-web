const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exclude = ['node_modules','dist','test-results','.git','graphify-out','.vercel'];
const exts = new Set(['.jsx','.js','.json','.html','.css','.md']);

function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir, {withFileTypes:true})) {
    if (exclude.includes(f.name)) continue;
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) results.push(...walk(fp));
    else if (exts.has(path.extname(f.name))) results.push(fp);
  }
  return results;
}

// Order matters: longest/most-specific first
const replacements = [
  ['AGRI360FREE', 'RYTHUFREE'],
  ['AgriConnect 360', 'RythuSphere'],
  ['AgriConnect360', 'RythuSphere'],
  ['agriconnect360', 'rythusphere'],
  ['Agriconnect360', 'Rythusphere'],
  ['AgriConnect QC Bot', 'RythuSphere QC Bot'],
  ['AgriConnect Price Alert', 'RythuSphere Price Alert'],
  ['Advertise on AgriConnect', 'Advertise on RythuSphere'],
  ['AgriConnect Admin', 'RythuSphere Admin'],
  ['AgriConnect app', 'RythuSphere app'],
  ['Hi%20AgriConnect', 'Hi%20RythuSphere'],
  ['/AgriConnect/i', '/RythuSphere/i'],
  ["'AgriConnect'", "'RythuSphere'"],
  ['AgriConnect', 'RythuSphere'],
  ['Agri360', 'RythuSphere'],
  ['agri360', 'rythusphere'],
  ['AGRI360', 'RYTHUSPHERE'],
  ['agri_admin', 'rythu_admin'],
  ['agri_demo', 'rythu_demo'],
  ['ac360_', 'rs_'],
];

const files = walk(root);
console.log('Processing ' + files.length + ' files...');
let changed = 0;

for (const f of files) {
  const buf = fs.readFileSync(f);
  let text = buf.toString('utf8');
  const original = text;
  
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  
  if (text !== original) {
    fs.writeFileSync(f, text, 'utf8');
    changed++;
    console.log('Updated: ' + path.basename(f));
  }
}
console.log('\nTotal: ' + changed + ' files updated');
