/**
 * Egern Widget 本地预览工具
 * 用法:
 *   node preview.js <widget.js>               → 生成 preview.html 并打开浏览器（推荐）
 *   node preview.js <widget.js> --json         → 仅输出 JSON 到 stdout
 *   node preview.js <widget.js> --serve        → 启动本地服务器（修改 widget 后刷新即更新）
 *   node preview.js <widget.js> env.json       → 带环境变量
 *
 * env.json 格式: { "POLICY": "自动选择", "YS": "1" }
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const widgetFile = process.argv[2];
if (!widgetFile) {
  console.error('用法: node preview.js <widget.js> [env.json] [--json|--serve]');
  process.exit(1);
}

const jsonOnly = process.argv.includes('--json');
const serveMode = process.argv.includes('--serve');
let env = {};
for (const a of process.argv.slice(3)) {
  if (a.startsWith('--')) continue;
  if (fs.existsSync(a)) { env = JSON.parse(fs.readFileSync(a, 'utf8')); break; }
}

// ── ctx 模拟 ─────────────────────────────────────────────────────
const httpGet = async (url, opts = {}) => {
  const timeout = opts.timeout || 5000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { method:'GET', headers:opts.headers||{}, signal:ctrl.signal, redirect:'follow' });
    const body = await res.text();
    clearTimeout(t);
    return { status:res.status, headers:Object.fromEntries(res.headers.entries()), text:async()=>body, json:async()=>JSON.parse(body), body };
  } catch(e) { clearTimeout(t); throw e; }
};
const httpPost = async (url, opts = {}) => {
  const timeout = opts.timeout || 5000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { method:'POST', headers:opts.headers||{}, body:opts.body||'', signal:ctrl.signal, redirect:'follow' });
    const body = await res.text();
    clearTimeout(t);
    return { status:res.status, headers:Object.fromEntries(res.headers.entries()), text:async()=>body, json:async()=>JSON.parse(body), body };
  } catch(e) { clearTimeout(t); throw e; }
};

const buildCtx = () => ({
  env,
  widgetFamily: process.env.WIDGET_FAMILY || 'systemMedium',
  device: {
    wifi: { ssid:'MyWiFi-5G', ip:'192.168.1.100', ipAddress:'192.168.1.100', gateway:'192.168.1.1' },
    ipv4: { address:'192.168.1.100', gateway:'192.168.1.1' },
    ipv6: { address:'' },
    cellular: { radio:'' },
    dnsServers: ['1.1.1.1','8.8.8.8'],
    screen: { width:440, height:956 },
    screenSize: { width:440, height:956 },
  },
  http: { get:httpGet, post:httpPost },
  proxy: { protocol:'VLESS', type:'VLESS' },
  colorScheme: 'light',
  appearance: 'light',
});

async function runWidget() {
  const p = path.resolve(widgetFile);
  if (!fs.existsSync(p)) throw new Error('文件不存在: ' + p);
  return await (await import('file://' + p)).default(buildCtx());
}

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  require('child_process').exec(cmd + ' ' + url);
}

// ── 图标映射 ─────────────────────────────────────────────────────
const I = {
  'waveform.path.ecg':'📡','wifi':'📶','antenna.radiowaves.left.and.right':'📡',
  'house.fill':'🏠','location.circle.fill':'📍','location.fill':'📍',
  'mappin.and.ellipse':'📍','map.fill':'🗺️','globe':'🌐',
  'globe.asia.australia.fill':'🌏','globe.americas.fill':'🌎',
  'network':'🌐','server.rack':'🖥️','building.2.fill':'🏢',
  'building.columns.fill':'🏛️','shield.lefthalf.filled':'🛡️',
  'checkmark.shield.fill':'✅','xmark.shield.fill':'❌',
  'exclamationmark.shield.fill':'⚠️','questionmark.shield.fill':'❓',
  'circle.hexagongrid.fill':'⬡','circle.hexagongrid':'⬡',
  'point.3.connected.trianglepath.dotted':'🔗',
  'paperplane.fill':'📨','paperplane':'📨',
  'play.rectangle.fill':'▶️','play.tv.fill':'📺',
  'music.note':'🎵','dot.radiowaves.left.and.right':'📻',
  'magnifyingglass':'🔍','sparkles':'✨','xmark':'✖️',
  'scope':'🎯','slider.horizontal.3':'🎚️',
  'clock':'🕐','timer':'⏱️','arrow.clockwise':'🔄',
  'arrow.up.and.down.circle.fill':'⏫',
  'router.fill':'📡','simcard.fill':'📱',
  'cloud.fill':'☁️','moon.stars.fill':'🌙',
  'gift.fill':'🎁','hourglass.circle.fill':'⏳',
  'cpu':'💻','iphone':'📱','wifi.slash':'❌',
};
function icon(n) {
  if (I[n]) return I[n];
  const s = n.replace(/\.fill$/,'').split('.').pop();
  return I[s] || (s.length <= 4 ? s : '●');
}
function clr(c, m) {
  if (!c) return '#888';
  if (typeof c === 'string') return c;
  if (c.light && c.dark) return m === 'dark' ? c.dark : c.light;
  return c.light || c.dark || '#888';
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function px(v) { return Math.round(v) + 'px'; }

function renderEl(node, mode) {
  if (!node) return '';
  if (typeof node === 'string') return esc(node);
  const t = node.type, s = [];
  const bg = clr(node.backgroundColor, mode);
  if (bg && bg !== 'transparent') s.push('background:' + bg);
  if (node.padding) {
    const p = Array.isArray(node.padding) ? node.padding.map(px).join(' ') : px(node.padding);
    s.push('padding:' + p);
  }
  if (node.borderRadius) s.push('border-radius:' + px(node.borderRadius));
  if (node.borderWidth && node.borderColor) s.push('border:' + px(node.borderWidth) + ' solid ' + clr(node.borderColor, mode));
  if (node.width) s.push('width:' + px(node.width));
  if (node.height) s.push('height:' + px(node.height));
  if (node.flex) s.push('flex:' + node.flex);
  let gbg = '';
  if (node.backgroundGradient && node.backgroundGradient.type === 'linear') {
    const cs = (node.backgroundGradient.colors || []).map(c => clr(c, mode));
    gbg = ';background:linear-gradient(135deg,' + cs.join(',') + ')';
  }
  if (t === 'widget') {
    const kids = (node.children || []).map(c => renderEl(c, mode)).join('');
    return '<div class="w ' + mode + '" style="' + s.join(';') + gbg + '">' + kids + '</div>';
  }
  if (t === 'stack') {
    const dir = node.direction === 'row' ? 'r' : 'c';
    const al = node.alignItems === 'start' ? 'flex-start' : node.alignItems === 'end' ? 'flex-end' : node.alignItems || 'center';
    const ga = node.gap ? 'gap:' + px(node.gap) : '';
    const kids = (node.children || []).map(c => renderEl(c, mode)).join('');
    return '<div class="' + dir + '" style="' + s.join(';') + ';align-items:' + al + ';' + ga + gbg + '">' + kids + '</div>';
  }
  if (t === 'text') {
    const fs = node.font?.size || 12;
    const fw = { regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800 }[node.font?.weight] || 400;
    const c = clr(node.textColor, mode), al = node.textAlign || 'left';
    return '<span class="tx" style="' + s.join(';') + ';font-size:' + fs + 'px;font-weight:' + fw + ';color:' + c + ';text-align:' + al + '">' + esc(String(node.text || '')) + '</span>';
  }
  if (t === 'image') {
    const sz = px(node.width || node.height || 13), c = clr(node.color, mode);
    const em = node.src?.startsWith('sf-symbol:') ? icon(node.src.slice(10)) : '●';
    return '<span class="ic" style="' + s.join(';') + ';font-size:' + px(Math.round((node.width || 13) * .85)) + ';color:' + c + ';width:' + sz + ';height:' + sz + '">' + em + '</span>';
  }
  if (t === 'spacer') return '<div class="sp" style="' + s.join(';') + '"></div>';
  return '';
}

function buildHtml(result) {
  const json = JSON.stringify(result);
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=440">\n<title>Egern Preview</title>\n<style>\n' +
    '*{margin:0;padding:0;box-sizing:border-box}\n' +
    'body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;justify-content:center;min-height:100vh}\n' +
    '.light body,.light{background:#f5f5f7}\n.dark body,.dark{background:#121212}\n' +
    '.w{display:flex;flex-direction:column;border-radius:20px;overflow:hidden;min-width:320px;max-width:440px}\n' +
    '.w.light{background:#fff;box-shadow:0 2px 20px rgba(0,0,0,.08)}\n' +
    '.w.dark{background:#1c1c1e;box-shadow:0 2px 20px rgba(0,0,0,.4)}\n' +
    '.r{display:flex;flex-direction:row}.c{display:flex;flex-direction:column}\n' +
    '.sp{flex:1}.tx{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.25}\n' +
    '.ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}\n' +
    '.tb{position:fixed;top:8px;right:8px;z-index:999;display:flex;gap:4px}\n' +
    '.tb button{padding:4px 10px;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600}\n' +
    '.tb .m{background:#333;color:#eee}.tb .m.on{background:#e94560}\n</style>\n</head>\n<body class="light">\n' +
    '<div class="tb"><button class="m on" id="bl">☀️</button><button class="m" id="bd">🌙</button></div>\n<div id="root"></div>\n<script>\n' +
    'var D=' + json + ';\n' +
    renderEl.toString() + '\n' + icon.toString() + '\n' + clr.toString() + '\n' + esc.toString() + '\n' + px.toString() + '\n' +
    'var I=' + JSON.stringify(I) + ';\n' +
    'function render(m){document.getElementById("root").innerHTML=renderEl(D,m||"light");document.body.className=m||"light";}\n' +
    'render("light");\n' +
    'document.getElementById("bl").onclick=function(){render("light");this.className="m on";document.getElementById("bd").className="m"};\n' +
    'document.getElementById("bd").onclick=function(){render("dark");this.className="m on";document.getElementById("bl").className="m"};\n' +
    '</script>\n</body>\n</html>';
}

// ── --json：仅输出 JSON ──────────────────────────────────────────
if (jsonOnly) {
  (async () => {
    try {
      const r = await runWidget();
      console.log(JSON.stringify(r, null, 2));
      console.error('\n✅ OK | ' + buildCtx().widgetFamily + ' | ' + JSON.stringify(r).length + ' bytes');
    } catch (e) { console.error('❌', e.message); process.exit(1); }
  })();
  return;
}

// ── --serve：本地服务器，修改 widget 后刷新 ───────────────────────
if (serveMode) {
  const rendererPath = path.join(__dirname, 'renderer.html');
  const rendererHtml = fs.existsSync(rendererPath) ? fs.readFileSync(rendererPath, 'utf8') : '';
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/widget.json') {
      try { const r = await runWidget(); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(r)); }
      catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
      return;
    }
    try {
      const r = await runWidget();
      const injected = rendererHtml.replace('</body>',
        '<script>document.getElementById("input").value=' + JSON.stringify(JSON.stringify(r)) + ';render();</script></body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(injected);
    } catch (e) {
      const injected = rendererHtml.replace('</body>',
        '<script>document.getElementById("input").value=' + JSON.stringify(JSON.stringify({ error: e.message })) + ';render();</script></body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(injected);
    }
  });
  server.listen(3456, () => {
    console.log('\n🚀 http://localhost:3456  (修改 widget JS 后刷新浏览器)\n');
    openBrowser('http://localhost:3456');
  });
  return;
}

// ── 默认：生成 preview.html 并打开 ────────────────────────────────
(async () => {
  try {
    const result = await runWidget();
    const html = buildHtml(result);
    const outPath = path.join(process.cwd(), 'preview.html');
    fs.writeFileSync(outPath, html);
    console.log('✅ ' + outPath + '  (' + (html.length / 1024).toFixed(0) + 'KB)');
    openBrowser('"' + outPath + '"');
  } catch (e) { console.error('❌', e.message); process.exit(1); }
})();
