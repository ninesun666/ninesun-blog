# Design Tokens - 设计令牌文档

> NineSun Blog Design System v1.0
> 基于 iOS Human Interface Guidelines + Brand Purple Theme

## 📁 文件结构

```
src/
├── design-tokens.css    # CSS 变量版本
├── tokens.json          # JSON 版本 (设计工具)
├── tokens.ts            # TypeScript 版本 (React/Chakra UI)
└── theme.ts             # Chakra UI 主题配置
```

## 🎨 颜色令牌 (Colors)

### 品牌色 (Brand Purple)

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-brand-50` | `#faf5ff` | 浅色背景 |
| `--color-brand-100` | `#f3e8ff` | 标签背景 |
| `--color-brand-200` | `#e9d5ff` | 边框、分隔线 |
| `--color-brand-300` | `#d8b4fe` | 禁用状态 |
| `--color-brand-400` | `#c084fc` | 辅助元素 |
| `--color-brand-500` | `#a855f7` | 图标、强调 |
| `--color-brand-600` | `#9333ea` | 文字链接 |
| `--color-brand-700` | `#7c3aed` | 主按钮、主色调 |
| `--color-brand-800` | `#6b21a8` | 悬停状态 |
| `--color-brand-900` | `#581c87` | 按下状态 |
| `--color-brand-950` | `#3b0764` | 最深色 |

### 功能色

| 类型 | Token | Hex |
|------|-------|-----|
| 成功 | `--color-success-500` | `#10b981` |
| 警告 | `--color-warning-500` | `#f59e0b` |
| 错误 | `--color-error-500` | `#ef4444` |
| 信息 | `--color-info-500` | `#3b82f6` |

### 语义颜色 (Semantic)

```css
/* 浅色模式 */
--color-bg-default: #f8fafc;      /* 页面背景 */
--color-bg-subtle: #ffffff;        /* 卡片背景 */
--color-fg-default: #1a1a2e;       /* 主要文字 */
--color-fg-muted: #6b7280;         /* 次要文字 */
--color-border-default: #e5e7eb;   /* 边框 */

/* 深色模式 (.dark) */
--color-bg-default: #0f0f1a;
--color-bg-subtle: #1a1a2e;
--color-fg-default: #e5e7eb;
--color-fg-muted: #9ca3af;
--color-border-default: #2d2d44;
```

## 📝 字体令牌 (Typography)

### 字体家族

```css
--font-family-heading: 'Inter', -apple-system, sans-serif;
--font-family-body: 'Inter', -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 字号

| Token | 大小 | 用途 |
|-------|------|------|
| `--font-size-xs` | 12px | 标签、辅助文字 |
| `--font-size-sm` | 13px | 小号文字 |
| `--font-size-md` | 14px | 默认正文 |
| `--font-size-lg` | 16px | 大正文 |
| `--font-size-xl` | 18px | 小标题 |
| `--font-size-2xl` | 20px | 标题 |
| `--font-size-3xl` | 24px | 大标题 |
| `--font-size-4xl` | 32px | 页面标题 |

### 行高

```css
--line-height-tight: 1.2;     /* 标题 */
--line-height-snug: 1.375;    /* 紧凑 */
--line-height-normal: 1.5;    /* 正常 */
--line-height-relaxed: 1.6;   /* 正文 */
--line-height-loose: 1.8;     /* 宽松 */
```

### 字重

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;  /* 按钮、标题 */
--font-weight-bold: 700;
--font-weight-extrabold: 800; /* 页面标题 */
```

## 📐 间距令牌 (Spacing)

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-1` | 4px | 紧凑间距 |
| `--space-2` | 8px | 相关元素 |
| `--space-3` | 12px | 默认间距 |
| `--space-4` | 16px | 区块间距 |
| `--space-5` | 20px | 卡片内边距 |
| `--space-6` | 24px | 大区块间距 |
| `--space-8` | 32px | 页面级间距 |

## ⭕ 圆角令牌 (Border Radius)

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 6px | Badge |
| `--radius-md` | 8px | 小按钮 |
| `--radius-lg` | 10px | 输入框 |
| `--radius-xl` | 12px | 按钮 |
| `--radius-2xl` | 16px | 卡片、弹窗 |
| `--radius-full` | 9999px | 圆形 |

## 🌑 阴影令牌 (Shadows)

```css
--shadow-card: 0 2px 12px rgba(0, 0, 0, 0.08);        /* 卡片默认 */
--shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12);  /* 卡片悬停 */
--shadow-dialog: 0 8px 32px rgba(0, 0, 0, 0.16);      /* 弹窗 */
--shadow-menu: 0 4px 16px rgba(0, 0, 0, 0.12);        /* 下拉菜单 */
```

## ⏱️ 过渡令牌 (Transitions)

### 时长

```css
--duration-fast: 150ms;    /* 快速反馈 */
--duration-normal: 200ms;  /* 默认过渡 */
--duration-slow: 300ms;    /* 卡片、复杂动画 */
```

### 缓动函数

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);                          /* 默认 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);                     /* 对称 */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);         /* 弹性 */
```

## 🔢 Z-Index 令牌

```css
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 500;
--z-popover: 600;
--z-toast: 800;
--z-tooltip: 900;
```

## 💻 使用示例

### CSS 中使用

```css
.my-component {
  background-color: var(--color-bg-subtle);
  color: var(--color-fg-default);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.my-component:hover {
  box-shadow: var(--shadow-card-hover);
}
```

### TypeScript/React 中使用

```tsx
import { tokens } from './tokens'

const styles = {
  backgroundColor: tokens.colors.semantic.light.bg.default,
  padding: tokens.spacing[4],
  borderRadius: tokens.radii.xl,
}
```

### Chakra UI 中使用

```tsx
import { Box, Button } from '@chakra-ui/react'

// 使用主题中的语义颜色
<Box bg="bg.subtle" color="fg.default" p="6" rounded="2xl">
  <Button bg="brand.700" _hover={{ bg: 'brand.800' }}>
    点击我
  </Button>
</Box>
```

## 🎨 设计原则

1. **一致性**: 始终使用设计令牌，避免硬编码值
2. **语义化**: 优先使用语义颜色（bg、fg、border）而非具体色值
3. **响应式**: 使用间距令牌确保布局一致性
4. **可访问性**: 确保颜色对比度符合 WCAG 标准
5. **暗黑模式**: 所有语义颜色都支持自动切换

## 🔄 更新记录

- **v1.0.0** (2026-03-19): 初始版本
  - 品牌紫色系统
  - iOS 风格圆角
  - 完整的语义颜色
  - 暗黑模式支持
