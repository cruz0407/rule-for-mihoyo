# NetworkRadar-Pro.js 合并计划

## 目标
将 A（网络诊断雷达，UI 精美）、B（Network-Pro.js，检测准）、C（数据中心.js，部分检测更优）三文件合并为一个 `Egern/Widget/NetworkRadar-Pro.js`。

## 模块来源决策

| 模块 | 来源 | 原因 |
|------|------|------|
| UI 框架 / 策略组 / 屏幕自适应 / 隐私打码 | A | A 独有，B/C 无 |
| 延迟 | A | 多端点容错（大陆5+全球4）远优于 B/C |
| 出口 IP 4源交叉验证 | A | 4源 > B的1源 > C的1源 |
| 本地网络 DNS/NAT/WiFi | A | A 独有，B/C 无 |
| 蜂窝制式映射 | B | GPRS→2.5G、LTE→4G、NR→5G |
| 本地 IP 双源回退 | C | ipip.net → 126.net |
| 纯净度/风险评分 | C | ippure + ipapi.is abuser_score 双源交叉 |
| Netflix | C | 双 title + Popcorn + countryCode |
| Disney+ | B | location 重定向检测 |
| TikTok | B | region 字段解析 |
| YouTube | C | contentRegion 解析（A/B 无专门逻辑） |
| ChatGPT | C | Web + iOS App 双端点 |
| Claude | B | cf-turnstile 精确检测 |
| Gemini | C | batchexecute → countryCode |
| Spotify / Prime | A | A 独有 |
| DeepSeek / Grok / Perplexity | A | A 独有 |
| ISP 识别 | A | A 已有完整体系 |

## 当前已完成

1. ✅ 复制 A 文件 → `NetworkRadar-Pro.js`
2. ✅ 插入 ippure + ipapi.is 查询函数（getIPPureInfo / getIPApiAbuserScore）
3. ✅ 插入精确检测函数（checkNetflixPrecise / checkDisneyPrecise / checkTikTokPrecise / checkYouTubePrecise / checkChatGPTPrecise / checkClaudePrecise / checkGeminiPrecise）
4. ✅ 修改主 Promise.all：添加 ippureData + ipapiAbuserData，流媒体/AI 检测中精确项传空 URL
5. ✅ 修改 testService：空 URL 时调用精确检测函数
6. ✅ 替换 purityScore / riskLevel 为双源版本
7. ✅ proxyCard 标签使用 ippure isResidential

## 待完成

### 1. 头部注释更新
- 更新文件头注释，说明此为 Pro 合并版
- 标注来源（A/B/C）
- 补充新增环境变量说明（如有）

### 2. 语法检查与修复
- 确认所有新增函数不依赖未定义的变量
- 确认 `const` → `let` 修复正确
- 检查 testService 中 `_precise` 字段是否被 serviceCard/serviceGrid 等 UI 函数使用（目前不会被破坏，因为 UI 只读 `ok` 和 `countryCode`）

### 3. 文件行数验证
- 确认文件有合理的行数（预计 ~4900 行）

### 4. 更新 README.md
- 改为多 JS 索引结构
- 新增 NetworkRadar-Pro.js 说明（功能特性、环境变量、使用方式）
- 保留 Countdown.js 原有说明

### 5. 提交并推送
- commit 所有更改
- push 到 GitHub
