/**
 * Egern Widget 本地预览工具
 * 用法: node preview.js <widget.js> [env.json]
 *
 * 示例:
 *   node preview.js NetworkRadar-Pro.js
 *   node preview.js NetworkRadar-Pro.js env.json
 *
 * env.json 格式:
 *   { "POLICY": "自动选择", "YS": "1" }
 */

const fs = require('fs');
const path = require('path');

const widgetFile = process.argv[2];
if (!widgetFile) {
  console.error('用法: node preview.js <widget.js> [env.json]');
  process.exit(1);
}

// ── 加载环境变量 ─────────────────────────────────────────────────
let env = {};
const envFile = process.argv[3];
if (envFile && fs.existsSync(envFile)) {
  env = JSON.parse(fs.readFileSync(envFile, 'utf8'));
}

// ── 模拟 ctx.http ────────────────────────────────────────────────
const httpGet = async (url, opts = {}) => {
  const timeout = opts.timeout || 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const headers = opts.headers || {};
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    const body = await res.text();
    clearTimeout(timer);

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      text: async () => body,
      json: async () => JSON.parse(body),
      body,
    };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};

const httpPost = async (url, opts = {}) => {
  const timeout = opts.timeout || 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: opts.headers || {},
      body: opts.body || '',
      signal: controller.signal,
      redirect: 'follow',
    });

    const body = await res.text();
    clearTimeout(timer);

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      text: async () => body,
      json: async () => JSON.parse(body),
      body,
    };
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};

// ── 模拟 ctx 对象 ────────────────────────────────────────────────
const mockCtx = {
  env,
  widgetFamily: process.env.WIDGET_FAMILY || 'systemMedium',

  device: {
    wifi: {
      ssid: 'MyWiFi-5G',
      ip: '192.168.1.100',
      ipAddress: '192.168.1.100',
      gateway: '192.168.1.1',
    },
    ipv4: {
      address: '192.168.1.100',
      gateway: '192.168.1.1',
    },
    ipv6: {
      address: '', // 设置非空字符串模拟有 IPv6
    },
    cellular: {
      radio: '', // 如 'LTE' / 'NR' / '5G'
    },
    dnsServers: ['1.1.1.1', '8.8.8.8'],
    screen: { width: 440, height: 956 },
    screenSize: { width: 440, height: 956 },
  },

  http: {
    get: httpGet,
    post: httpPost,
  },

  proxy: {
    protocol: 'VLESS',
    type: 'VLESS',
  },

  colorScheme: 'light',   // 'light' | 'dark'
  appearance: 'light',
};

// ── 加载并执行 widget ────────────────────────────────────────────
(async () => {
  try {
    const widgetPath = path.resolve(widgetFile);
    if (!fs.existsSync(widgetPath)) {
      console.error(`文件不存在: ${widgetPath}`);
      process.exit(1);
    }

    const widget = await import('file://' + widgetPath);
    const result = await widget.default(mockCtx);

    console.log(JSON.stringify(result, null, 2));

    // 统计
    const str = JSON.stringify(result);
    console.error(`\n✅ 预览成功 | 尺寸: ${mockCtx.widgetFamily} | 输出: ${str.length} 字节`);
    if (result.children) {
      console.error(`   children 数量: ${result.children.length}`);
    }
  } catch (e) {
    console.error('❌ Widget 执行失败:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
