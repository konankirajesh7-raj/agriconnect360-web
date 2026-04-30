import { readFileSync, writeFileSync } from 'fs';

const md = readFileSync('./AGRICONNECT360_MASTER_DOCUMENT.md', 'utf8');

// Simple MD to HTML
let html = md
  .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
  .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/^---$/gm, '<hr/>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/^\| (.+)$/gm, (m) => {
    const cells = m.split('|').filter(c=>c.trim()).map(c=>`<td>${c.trim()}</td>`).join('');
    return `<tr>${cells}</tr>`;
  })
  .replace(/^```[\s\S]*?```$/gm, (m) => `<pre>${m.replace(/^```\w*\n?/,'').replace(/```$/,'')}</pre>`)
  .replace(/\n\n/g, '</p><p>')
  .replace(/\n/g, '<br/>');

const page = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>AgriConnect 360 — Master Document</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#1a1a2e;line-height:1.6;padding:40px 50px;max-width:210mm;margin:auto}
h1{font-size:28px;color:#059669;margin:30px 0 10px;border-bottom:3px solid #059669;padding-bottom:8px}
h2{font-size:20px;color:#1e293b;margin:25px 0 8px;border-left:4px solid #059669;padding-left:12px}
h3{font-size:16px;color:#334155;margin:18px 0 6px}
h4{font-size:14px;color:#475569;margin:12px 0 4px}
p{margin:6px 0}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}
td,th{border:1px solid #e2e8f0;padding:6px 10px;text-align:left}
tr:nth-child(odd){background:#f8fafc}
tr:first-child{background:#059669;color:#fff;font-weight:700}
code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;color:#059669}
pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;font-size:11px;overflow-x:auto;margin:10px 0}
blockquote{border-left:3px solid #f59e0b;padding:8px 16px;background:#fffbeb;margin:10px 0;font-size:13px}
hr{border:none;border-top:2px solid #e2e8f0;margin:20px 0}
li{margin:3px 0 3px 20px;font-size:13px}
b{color:#0f172a}
.cover{text-align:center;padding:80px 20px;page-break-after:always}
.cover h1{font-size:42px;border:none;color:#059669}
.cover p{font-size:16px;color:#64748b}
@media print{body{padding:20px 25px}h1{page-break-before:always}h1:first-child{page-break-before:avoid}.cover{page-break-before:avoid}}
</style></head><body>
<div class="cover">
<h1 style="font-size:42px;border:none">🌾 AgriConnect 360</h1>
<p style="font-size:22px;color:#1e293b;font-weight:700">Complete Master Document</p>
<p>Zero-to-Hero Project Blueprint</p>
<p style="margin-top:40px">Version 1.0 FINAL — April 2026</p>
<p>Platform: agriconnect360-web.vercel.app</p>
<p style="margin-top:60px;font-size:14px;color:#94a3b8">47 Modules • 7 User Roles • 7 API Integrations • 800+ Tests Verified</p>
</div>
${html}
</body></html>`;

writeFileSync('./AGRICONNECT360_MASTER_DOCUMENT.html', page);
console.log('HTML generated: AGRICONNECT360_MASTER_DOCUMENT.html');
console.log('Open in browser → Print → Save as PDF');
