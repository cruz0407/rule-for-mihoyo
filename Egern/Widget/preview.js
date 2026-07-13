/**
 * Egern Widget 本地预览工具
 * 用法:
 *   node preview.js <widget.js>               → 输出 JSON
 *   node preview.js <widget.js> --serve        → 启动网页预览
 *   node preview.js <widget.js> env.json       → 带环境变量
 *
 * env.json 格式: { "POLICY": "自动选择", "YS": "1" }
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const widgetFile = process.argv[2];
if (!widgetFile) {
  console.error('用法: node preview.js <widget.js> [env.json] [--serve]');
  process.exit(1);
}

const serveMode = process.argv.includes('--serve');
let env = {};
for (const a of process.argv.slice(3)) {
  if (a === '--serve') continue;
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
  const widgetPath = path.resolve(widgetFile);
  if (!fs.existsSync(widgetPath)) throw new Error(`文件不存在: ${widgetPath}`);
  const widget = await import('file://' + widgetPath);
  return await widget.default(buildCtx());
}

// ── CLI 模式：直接输出 JSON ──────────────────────────────────────
if (!serveMode) {
  (async () => {
    try {
      const result = await runWidget();
      console.log(JSON.stringify(result, null, 2));
      const str = JSON.stringify(result);
      console.error(`\n✅ 预览成功 | 尺寸: ${buildCtx().widgetFamily} | 输出: ${str.length} 字节`);
    } catch(e) {
      console.error('❌ Widget 执行失败:', e.message);
      process.exit(1);
    }
  })();
  return;
}

// ── Serve 模式：启动本地网页预览 ─────────────────────────────────
const rendererPath = path.join(__dirname, 'renderer.html');
if (!fs.existsSync(rendererPath)) {
  console.error('❌ renderer.html 不存在，请确保与 preview.js 在同一目录');
  process.exit(1);
}
const rendererHtml = fs.readFileSync(rendererPath, 'utf8');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/widget.json') {
    // 每次请求重新执行 widget（方便调试）
    try {
      const result = await runWidget();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200).end('ok');
    return;
  }

  // 主页：renderer.html + 自动注入 JSON 到 textarea
  try {
    const result = await runWidget();
    const json = JSON.stringify(result);
    // 在 renderer.html 关闭 </body> 前注入脚本：自动填充并渲染
    const injected = rendererHtml.replace('</body>',
      `<script>document.getElementById('input').value = ${JSON.stringify(json)}; render();</script></body>`
    );
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(injected);
  } catch(e) {
    const injected = rendererHtml.replace('</body>',
      `<script>document.getElementById('input').value = ${JSON.stringify({error:e.message})}; render();</script></body>`
    );
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(injected);
  }
});

const PORT = 3456;
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🚀 预览服务已启动: ${url}`);
  console.log('   按 Ctrl+C 停止\n');

  // 自动打开浏览器
  const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  require('child_process').exec(`${start} ${url}`);
});
