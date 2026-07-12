# 时光倒数 (Countdown) 小组件

适用于 Egern 的节日/纪念日倒计时小组件，支持 Small、Medium、Large 三种尺寸。

## 使用方法

1. 将 `Countdown.js` 的 Raw 链接填入 Egern 的 Widget 配置中
2. 在 Egern 的环境变量（Env）中设置以下变量即可自定义

> Raw 链接：`https://raw.githubusercontent.com/cruz0407/rule-for-mihoyo/main/Egern/Widget/Countdown.js`

## 环境变量一览

### 显示开关

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SHOW_SCHOOL_HOLIDAYS` | 布尔 | `true` | 是否显示春假、秋假倒计时 |
| `SHOW_FINANCE_DATES` | 布尔 | `true` | 是否显示金融交割日、行权日倒计时 |
| `SHOW_EXCLUSIVE_DATES` | 布尔 | `false` | 是否显示专属纪念日（我的生日等） |

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
