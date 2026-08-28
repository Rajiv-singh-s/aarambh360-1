const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

if (!fs.existsSync(outDir)) {
  console.log('No out directory found, skipping asset rename');
  process.exit(0);
}

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (
      entry.name.endsWith('.html') ||
      entry.name.endsWith('.js') ||
      entry.name.endsWith('.css') ||
      entry.name.endsWith('.txt')
    ) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('/_next/')) {
        content = content.replace(/\/_next\//g, '/next_assets/');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

// 1. Rename _next folder to next_assets
const oldNext = path.join(outDir, '_next');
const newNext = path.join(outDir, 'next_assets');

if (fs.existsSync(oldNext)) {
  if (fs.existsSync(newNext)) {
    fs.rmSync(newNext, { recursive: true, force: true });
  }
  fs.renameSync(oldNext, newNext);
  console.log('Renamed _next to next_assets');
}

// 2. Replace references across all files
replaceInDir(outDir);
console.log('Replaced all /_next/ references with /next_assets/ successfully');
