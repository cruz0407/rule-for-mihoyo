# Egern Widgets

本目录包含适用于 Egern 的小组件脚本。

---

## 📦 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| ⏳ 时光倒数 | [Countdown.js](https://raw.githubusercontent.com/cruz0407/rule-for-mihoyo/main/Egern/Widget/Countdown.js) | 节日/纪念日倒计时，支持农历、金融日期、专属纪念日 |
| 🛰️ 网络诊断雷达 Pro | [NetworkRadar-Pro.js](https://raw.githubusercontent.com/cruz0407/rule-for-mihoyo/main/Egern/Widget/NetworkRadar-Pro.js) | 全面网络状态检测：延迟、出口 IP、纯净度、流媒体/AI 解锁 |

---

# ⏳ 时光倒数 (Countdown)

适用于 Egern 的节日/纪念日倒计时小组件，支持 Small、Medium、Large 三种尺寸。

## 使用方法

1. 将 Raw 链接填入 Egern 的 Widget 配置中
2. 在 Egern 的环境变量（Env）中设置以下变量即可自定义

## 环境变量

### 显示开关

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SHOW_SCHOOL_HOLIDAYS` | 布尔 | `true` | 是否显示春假、秋假倒计时 |
| `SHOW_FINANCE_DATES` | 布尔 | `true` | 是否显示金融交割日、行权日倒计时 |
| `SHOW_EXCLUSIVE_DATES` | 布尔 | `false` | 是否显示专属纪念日（我的生日等）。开启后控制整个「专属」列的显隐 |

### 排序与样式

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `ENABLE_PRIORITY_SORT` | 布尔 | `true` | 是否启用节日优先级排序（重要节日靠前） |
| `ENABLE_EXCLUSIVE_WEIGHT` | 布尔 | `true` | 专属纪念日是否获得最高优先级（权重 9） |
| `ENABLE_WEEKEND_THEME` | 布尔 | `true` | 周末是否切换为蓝色调背景主题 |

### 日期自定义

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `QINGMING_DATE` | 字符串 | `4/4` | 清明节日期，格式 `M/D`（如 `4/5`） |
| `SPRING_BREAK_DATE` | 字符串 | 清明前 3 天 | 春假起始日期，格式 `M/D`（如 `3/30`） |
| `AUTUMN_BREAK_DATE` | 字符串 | 11 月第二个周一 | 秋假起始日期，格式 `M/D`（如 `11/10`） |

### 置顶节日

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PINNED_HOLIDAY` | 字符串 | 空 | 需要置顶显示的节日名称，多个用英文逗号分隔（如 `春节,国庆节`） |

### 专属纪念日（需先开启 `SHOW_EXCLUSIVE_DATES=true`）

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `EXCLUSIVE_NAME_1` | 字符串 | `我的生日` | 第 1 个专属纪念日名称 |
| `EXCLUSIVE_DATE_1` | 字符串 | `11/10` | 第 1 个专属纪念日日期，格式 `M/D` |
| `EXCLUSIVE_NAME_2` ~ `_6` | 字符串 | 空 | 第 2~6 个专属纪念日名称 |
| `EXCLUSIVE_DATE_2` ~ `_6` | 字符串 | 空 | 第 2~6 个专属纪念日日期，格式 `M/D` |

> 💡 兼容旧版：`EXCLUSIVE_NAME` / `EXCLUSIVE_DATE` 等价于 `EXCLUSIVE_NAME_1` / `EXCLUSIVE_DATE_1`

## 配置示例

```
SHOW_EXCLUSIVE_DATES=true
EXCLUSIVE_NAME_1=我的生日
EXCLUSIVE_DATE_1=11/10
EXCLUSIVE_NAME_2=恋爱纪念日
EXCLUSIVE_DATE_2=5/20
PINNED_HOLIDAY=春节,国庆节
```

## 功能特性

- 📐 自适应 Small / Medium / Large 三种尺寸
- 📅 内置农历算法，支持法定节假日、民俗节日、国际节日
- 💰 金融交割日（每月第三个周五）和行权日（每月第四个周三）
- 🎨 根据工作日/周末/节假日自动切换背景渐变
- 🔝 支持指定节日跨分类置顶
- ⏰ UTC+8 时区基准

---

# 🛰️ 网络诊断雷达 Pro (NetworkRadar-Pro)

全面网络状态检测小组件，支持 Medium / Large 尺寸。

> 🔄 合并自三个上游项目，取其精华：
> - **UI 框架 + 策略组 + 延迟/出口 IP** 来自 [lylywayr/NetWork-Module](https://github.com/lylywayr/NetWork-Module)
> - **精准流媒体/AI 检测** 来自 [xcgtb/Egern-Widgets](https://github.com/xcgtb/Egern-Widgets)
> - **双源纯净度评分** 来自 [mickeu/Egern](https://github.com/mickeu/Egern)

## 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `POLICY` | 字符串 | 空 | 全局策略组。指定后所有检测统一走该策略 |
| `LMT` | 字符串 | 空 | 流媒体检测策略组。`POLICY` 为空时生效 |
| `AI` | 字符串 | 空 | AI 检测策略组。`POLICY` 为空时生效 |
| `YS` | 字符串 | `0` | `1` 启用 IP 隐私打码（如 `123.123.*.*`） |
| `XY` | 字符串 | 空 | 手动指定协议（VLESS / Trojan / HY2 / AnyTLS） |

## 检测能力

### 本地网络
- 网络类型识别（WiFi SSID / 蜂窝数据制式）
- 网关、内网 IP、公网 IP、地理位置
- DNS 供应商识别（Cloudflare / Google / AliDNS / 114 等 10+ 种）
- IPv4/IPv6 双栈检测
- NAT 类型（Open / CGNAT / NAT）

### 代理出口
- 4 源交叉验证出口 IP（ipapi.is / ip-api / ipwho.is / ipinfo）
- 出口地区（国家 + 城市）、ISP/AS 信息
- 网络属性（住宅 / 移动 / 机房）

### 延迟
- 直连延迟：5 个大陆端点取平均（miui / vivo / baidu / qq / aliyun）
- 代理延迟：4 个全球端点取平均（CF / gstatic / google / CF favicon）

### 纯净度（Pro 增强）
- **ippure.com** fraudScore + isResidential
- **ipapi.is** abuser_score 等级
- 双源交叉验证，取代原版粗糙自建评分

### 流媒体解锁（Pro 增强）

| 服务 | 检测方式 |
|------|----------|
| Netflix | 双 title ID（81280792 + 70143836）+ Popcorn 状态 + countryCode |
| Disney+ | location 重定向精确检测 |
| TikTok | 页面 region 字段解析 |
| YouTube | contentRegion 解析 + google.cn 重定向检测 |
| Spotify | 页面状态检测 |
| Prime Video | 页面状态检测 |

### AI 解锁（Pro 增强）

| 服务 | 检测方式 |
|------|----------|
| ChatGPT | Web + iOS App 双端点检测（区分 APP/Web/全解锁） |
| Claude | cf-turnstile 精确检测 |
| Gemini | batchexecute API → countryCode 三级正则回退 |
| DeepSeek | 页面状态检测 |
| Grok | 页面状态检测 |
| Perplexity | 页面状态检测 |

### 其他
- UDP/QUIC 支持检测
- 节点协议识别
- 多策略并行探测与缓存
- 屏幕自适应缩放

## 配置示例

```
POLICY=自动选择
LMT=流媒体
AI=AI服务
YS=1
```
