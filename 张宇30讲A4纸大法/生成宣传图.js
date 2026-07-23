const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = path.join(__dirname, '宣传图');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const posters = [
  { id: '01-蓝白竖版', w: 580, h: 760, cls: 'blue', square: false },
  { id: '02-深灰竖版', w: 580, h: 760, cls: 'dark', square: false },
  { id: '03-蓝白方版', w: 580, h: 580, cls: 'blue', square: true },
];

const template = fs.readFileSync(path.join(__dirname, '宣传海报.html'), 'utf-8');

for (const p of posters) {
  let html = template;

  html = html.replace(
    /<div class="poster ([^"]*)"/g,
    (match, classes) => {
      const isTargetSquare = classes.includes('square') && p.square && classes.includes(p.cls);
      const isTargetNotSquare = !classes.includes('square') && !p.square && classes.includes(p.cls);
      if (isTargetSquare || isTargetNotSquare) return match;
      return match + ' style="display:none"';
    }
  );

  html = html.replace(
    'body {',
    'body { width: ' + p.w + 'px; height: ' + p.h + 'px; overflow: hidden; display: flex; align-items: center; justify-content: center;'
  );

  const tmpFile = path.join(OUT, '_' + p.id + '.html');
  fs.writeFileSync(tmpFile, html);

  const pngFile = path.join(OUT, p.id + '.png');
  try {
    execSync(
      `"${EDGE}" --headless --disable-gpu --screenshot="${pngFile}" --window-size=${p.w},${p.h} "file:///${tmpFile.replace(/\\/g, '/')}"`,
      { timeout: 30000, stdio: 'pipe' }
    );
    console.log('OK: ' + p.id + '.png');
  } catch (e) {
    console.error('FAIL: ' + p.id + ' - ' + e.message);
  }

  fs.unlinkSync(tmpFile);
}

console.log('\nDone! 图片保存在 ' + OUT);
