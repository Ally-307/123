const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = path.join(__dirname, '..', 'pdf三十讲');
const OUT_DIR = __dirname;

// Step 1: 加载所有30讲数据
const lectures = {};

// 拼接所有文件源码，去掉重复的 const lectures = {} 声明
let combinedSrc = '';
for (let i = 1; i <= 6; i++) {
  let src = fs.readFileSync(path.join(DATA_DIR, `lec_data_${i}.js`), 'utf-8');
  // 移除 const lectures = {}; 声明（所有文件都有）
  src = src.replace(/^const lectures = \{\};?\s*$/gm, '');
  // 移除 module.exports
  src = src.replace(/^module\.exports\s*=\s*lectures;?\s*$/gm, '');
  // 移除注释行
  src = src.replace(/^\/\/.*$/gm, '');
  combinedSrc += src + '\n';
}

const sandbox = { lectures, console };
vm.createContext(sandbox);
try {
  vm.runInContext(combinedSrc, sandbox);
  console.log('Data loaded successfully');
} catch (e) {
  console.error('Error loading lecture data:', e.message);
  console.error('Line:', e.stack);
}

const allLecs = Object.keys(lectures).sort((a, b) => {
  return parseInt(a.replace('lec', '')) - parseInt(b.replace('lec', ''));
});

console.log(`Loaded ${allLecs.length} lectures`);

// Step 2: 生成 A4 打印优化的 HTML
const examLabels = { s1: '数一', s2: '数二', s3: '数三' };

function buildHTML() {
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>2027考研数学张宇30讲 · A4纸大法</title>
<link rel="stylesheet" href="https://cdn.staticfile.org/KaTeX/0.16.9/katex.min.css">
<script src="https://cdn.staticfile.org/KaTeX/0.16.9/katex.min.js"><\/script>
<script src="https://cdn.staticfile.org/KaTeX/0.16.9/contrib/auto-render.min.js"><\/script>
<style>
@page { size: A4; margin: 8mm; }

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f5f0eb; color: #3d2a15; line-height: 1.45;
}

.a4-page {
  width: 210mm; min-height: 297mm;
  padding: 8mm 9mm; margin: 0 auto 8px;
  background: #fffdf9;
  border: 1px solid #e8ddd0;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  page-break-after: always;
  font-size: 8.5px;
  display: flex; flex-direction: column;
}

.a4-page:last-child { page-break-after: auto; }

/* Header */
.lec-header {
  display: flex; align-items: baseline; justify-content: space-between;
  border-bottom: 2px solid #d4a574; padding-bottom: 3px;
  margin-bottom: 5px;
}
.lec-num { font-size: 10px; font-weight: 900; color: #b8753e; }
.lec-title { font-size: 14px; font-weight: 900; color: #3d2a15; }
.exam-badges { display: flex; gap: 3px; }
.exam-badge {
  font-size: 7px; padding: 1px 6px; border-radius: 8px; font-weight: 600;
}
.exam-badge.s1 { background: #fef3e4; color: #b8753e; }
.exam-badge.s2 { background: #f3e8ff; color: #7c3aed; }
.exam-badge.s3 { background: #fce7f3; color: #db2777; }

/* Body */
.lec-body { flex: 1; }
.lec-body h3 {
  font-size: 10px; font-weight: 700; margin: 6px 0 3px;
  color: #b8753e; padding-left: 6px; border-left: 2px solid #d4a574;
}
.lec-body h4 { font-size: 9px; font-weight: 600; margin-bottom: 2px; color: #4a3520; }

/* Overview */
.overview p { font-size: 8.5px; color: #7a6958; }

/* KP Grid */
.kp-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 3px 0;
}
.kp-item {
  background: #fdfaf5; border: 1px solid #ece3d5;
  border-radius: 5px; padding: 5px 7px;
}
.kp-item h4 { font-size: 8px; font-weight: 700; color: #4a3520; margin-bottom: 1px; }
.kp-item p { font-size: 7.5px; color: #7a6958; line-height: 1.35; }

/* Method list */
.method-list { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
.method-list li {
  padding: 3px 6px; background: #fdfaf5; border: 1px solid #ece3d5;
  border-radius: 4px; font-size: 7.5px; display: flex; align-items: flex-start; gap: 4px;
  line-height: 1.3;
}
.step-num {
  width: 14px; height: 14px; min-width: 14px; border-radius: 50%;
  background: #d4a574; display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff; margin-top: 1px;
}

/* Formula box */
.formula-box {
  background: #fdfaf5; border: 1px solid #ece3d5;
  border-radius: 5px; padding: 6px 8px; margin: 3px 0;
  font-size: 9px; overflow-x: auto;
}
.formula-box .katex { font-size: 0.95em; }
.formula-box strong { color: #4a3520; }

/* Tips / Warn / Exam boxes */
.tips-box, .warn-box, .exam-box {
  border-radius: 5px; padding: 4px 8px; margin: 3px 0; font-size: 7.5px; line-height: 1.35;
}
.tips-box { background: #fff8f0; border: 1px solid #f0dcc0; color: #b8753e; }
.tips-box::before { content: '技巧：'; font-weight: 700; }
.warn-box { background: #fef5f5; border: 1px solid #f5c8c8; color: #c53030; }
.warn-box::before { content: '误区：'; font-weight: 700; }
.exam-box { background: #f2faf5; border: 1px solid #c8e6d0; color: #2d6a4f; }
.exam-box::before { content: '常考：'; font-weight: 700; }

/* Footer */
.lec-footer {
  margin-top: auto; padding-top: 3px;
  border-top: 1px solid #ece3d5; font-size: 7px; color: #b8a99a;
  display: flex; justify-content: space-between;
}

/* Print */
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
  .a4-page { margin: 0; border: none; box-shadow: none; border-radius: 0; }
}

/* Screen preview */
@media screen {
  body { background: #f5f0eb; padding: 20px; }
}

/* Hero */
.hero {
  text-align: center; padding: 28px 20px 18px; max-width: 800px; margin: 0 auto 16px;
}
.hero h1 { font-size: 22px; font-weight: 900; color: #3d2a15; margin-bottom: 6px; }
.hero h1 span { color: #b8753e; }
.hero .hero-sub { font-size: 13px; color: #a68b7a; margin-bottom: 10px; }
.hero-stats { display: flex; justify-content: center; gap: 24px; }
.hero-stat { text-align: center; }
.hero-stat .hs-num { font-size: 24px; font-weight: 900; color: #c2410c; }
.hero-stat .hs-label { font-size: 11px; color: #a68b7a; }
.hero-actions { margin-top: 12px; display: flex; gap: 10px; justify-content: center; }
.hero-btn {
  padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600;
  text-decoration: none; transition: all 0.2s; cursor: pointer; border: none;
  font-family: inherit;
}
.hero-btn.primary { background: #e8d0b0; color: #7a4a2a; }
.hero-btn.primary:hover { background: #ddc098; }
.hero-btn.secondary { background: #fffdf9; color: #a68b7a; border: 1px solid #e8ddd0; }
.hero-btn.secondary:hover { background: #fdf8f2; }
@media print { .hero { display: none; } }

.overview p strong { color: #4a3520; }
</style>
</head>
<body>
<div class="hero">
  <h1>2027考研数学 · <span>张宇30讲A4纸大法</span></h1>
  <p class="hero-sub">每讲一张A4纸，30张搞定考研数学全体系 — 可在线浏览，也可打印</p>
  <div class="hero-stats">
    <div class="hero-stat"><div class="hs-num">30</div><div class="hs-label">张A4纸</div></div>
    <div class="hero-stat"><div class="hs-num">📐</div><div class="hs-label">高数16讲</div></div>
    <div class="hero-stat"><div class="hs-num">📊</div><div class="hs-label">线代7讲</div></div>
    <div class="hero-stat"><div class="hs-num">🎲</div><div class="hs-label">概率7讲</div></div>
  </div>
  <div class="hero-actions">
    <button class="hero-btn primary" onclick="window.print()">🖨️ 打印全部</button>
    <a class="hero-btn secondary" href="#lec01">📋 开始浏览</a>
  </div>
</div>
`;

  for (const key of allLecs) {
    const lec = lectures[key];
    const badges = [];
    if (lec.exams) {
      if (lec.exams.s1) badges.push('<span class="exam-badge s1">数一</span>');
      if (lec.exams.s2) badges.push('<span class="exam-badge s2">数二</span>');
      if (lec.exams.s3) badges.push('<span class="exam-badge s3">数三</span>');
    }

    // Clean up content HTML — remove newlines and extra spaces between tags
    let content = lec.content || '';
    // Remove excessive whitespace between HTML tags
    content = content.replace(/>\s+</g, '><');
    content = content.replace(/\s{2,}/g, ' ');

    html += `
<div class="a4-page" id="lec${lec.num}">
  <div class="lec-header">
    <div>
      <span class="lec-num">第${lec.num}讲</span>
      <span class="lec-title">${lec.title}</span>
    </div>
    <div class="exam-badges">${badges.join('')}</div>
  </div>
  <div class="lec-body">
    ${content}
  </div>
  <div class="lec-footer">
    <span>2027考研数学 · 张宇30讲</span>
    <span>第${lec.num}讲 / 共30讲</span>
  </div>
</div>

`;
  }

  html += `
<script>
  renderMathInElement(document.body, {
    delimiters: [
      {left: '\$\$', right: '\$\$', display: true},
      {left: '\$', right: '\$', display: false},
      {left: '\\\\[', right: '\\\\]', display: true},
      {left: '\\\\(', right: '\\\\)', display: false}
    ],
    throwOnError: false
  });
<\/script>
</body>
</html>`;

  return html;
}

// Step 3: 写入文件
const html = buildHTML();
const htmlPath = path.join(OUT_DIR, '张宇30讲-A4纸大法.html');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('HTML written to:', htmlPath);

// Step 4: 生成 PDF
const { execSync } = require('child_process');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const pdfPath = path.join(OUT_DIR, '张宇30讲-A4纸大法.pdf');
try {
  execSync(
    `"${EDGE}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "file:///${htmlPath.replace(/\\/g, '/')}"`,
    { timeout: 120000, stdio: 'pipe' }
  );
  console.log('PDF written to:', pdfPath);

  const stat = fs.statSync(pdfPath);
  console.log(`PDF size: ${(stat.size / 1024).toFixed(0)} KB`);
} catch (e) {
  console.error('PDF generation failed:', e.message);
  console.log('You can manually print the HTML to PDF from browser.');
}
